package expo.modules.glassreflection

import android.graphics.Bitmap
import android.graphics.Rect
import android.graphics.RectF
import android.view.View
import android.view.Window
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

class ReflectionTuning {
  var saturation: Float = 1f
  var brightness: Float = 1f
}

class SampleRequest(
  val root: View,
  val window: Window?,
  val above: RectF,
  val below: RectF?
)

class WindowCapture {
  var originX: Float = 0f
    private set
  var originY: Float = 0f
    private set
  var width: Int = 0
    private set
  var height: Int = 0
    private set
  var scaleX: Float = 0f
    private set
  var scaleY: Float = 0f
    private set
  var pixels: IntArray = IntArray(0)
    private set

  private var bitmap: Bitmap? = null

  fun prepare(region: Rect, density: Float): Bitmap {
    val targetWidth = max(1, ceil(region.width() * SCALE_X / density).toInt())
    val targetHeight = max(1, ceil(region.height() * SCALE_Y / density).toInt())
    val current = bitmap
    val target =
      if (current != null && current.width == targetWidth && current.height == targetHeight) {
        current
      } else {
        Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888).also { bitmap = it }
      }
    originX = region.left.toFloat()
    originY = region.top.toFloat()
    width = targetWidth
    height = targetHeight
    scaleX = targetWidth / region.width().toFloat()
    scaleY = targetHeight / region.height().toFloat()
    return target
  }

  fun read() {
    val source = bitmap ?: return
    val count = width * height
    if (pixels.size < count) {
      pixels = IntArray(count)
    }
    source.getPixels(pixels, 0, width, 0, 0, width, height)
  }

  companion object {
    const val SCALE_X: Float = 0.25f
    const val SCALE_Y: Float = 0.055f
  }
}

class EdgeProcessor {
  sealed class Result {
    data object Unchanged : Result()
    class Updated(val row: FloatArray?) : Result()
  }

  private var cols: Int = 0
  private val line: FloatArray = FloatArray(MAX_COLUMNS * 3)
  private val blurred: FloatArray = FloatArray(MAX_COLUMNS * 3)
  private val bytes: IntArray = IntArray(MAX_COLUMNS * 4)
  private val lastBytes: IntArray = IntArray(MAX_COLUMNS * 4)
  private var hasContent: Boolean = false

  fun reset() {
    hasContent = false
  }

  fun clear(): Result {
    if (!hasContent) return Result.Unchanged
    hasContent = false
    return Result.Updated(null)
  }

  fun process(
    capture: WindowCapture,
    rect: RectF,
    nearAtBottom: Boolean,
    tuning: ReflectionTuning,
    density: Float
  ): Result {
    val newCols = (rect.width() / density * WindowCapture.SCALE_X).roundToInt().coerceIn(4, MAX_COLUMNS)
    if (newCols != cols) {
      cols = newCols
      hasContent = false
    }

    val rows = max(1, (rect.height() / density * WindowCapture.SCALE_Y).roundToInt())
    val x0 = floor((rect.left - capture.originX) * capture.scaleX).toInt()
    val y0 = floor((rect.top - capture.originY) * capture.scaleY).toInt()
    val captureWidth = capture.width
    val captureHeight = capture.height
    val source = capture.pixels
    val saturation = tuning.saturation
    val gain = tuning.brightness

    for (c in 0 until cols) {
      val x = x0 + c
      var sumRed = 0f
      var sumGreen = 0f
      var sumBlue = 0f
      var weightedLight = 0f
      var weightSum = 0f
      if (x in 0 until captureWidth) {
        for (r in 0 until rows) {
          val y = y0 + r
          if (y < 0 || y >= captureHeight) continue
          val nearness = if (nearAtBottom) (r + 1).toFloat() / rows else (rows - r).toFloat() / rows
          val near = 1f + 1.5f * nearness
          val pixel = source[y * captureWidth + x]
          val alpha = (pixel ushr 24) * INV_255
          val red = ((pixel shr 16) and 0xFF) * INV_255 * alpha
          val green = ((pixel shr 8) and 0xFF) * INV_255 * alpha
          val blue = (pixel and 0xFF) * INV_255 * alpha
          val lum = 0.2126f * red + 0.7152f * green + 0.0722f * blue
          val weight = near * lum * lum
          sumRed += red * weight
          sumGreen += green * weight
          sumBlue += blue * weight
          weightedLight += weight
          weightSum += near
        }
      }
      var red = 0f
      var green = 0f
      var blue = 0f
      if (weightedLight > 1e-5f) {
        red = sumRed / weightedLight
        green = sumGreen / weightedLight
        blue = sumBlue / weightedLight
        val peak = maxOf(red, green, blue, 1e-4f)
        val strength = min(1f, sqrt(weightedLight / weightSum) * 2f)
        red = (red * 0.4f + red / peak * 0.6f) * strength
        green = (green * 0.4f + green / peak * 0.6f) * strength
        blue = (blue * 0.4f + blue / peak * 0.6f) * strength
        val luma = 0.2126f * red + 0.7152f * green + 0.0722f * blue
        red = (luma + (red - luma) * saturation) * gain
        green = (luma + (green - luma) * saturation) * gain
        blue = (luma + (blue - luma) * saturation) * gain
      }
      line[c * 3] = red
      line[c * 3 + 1] = green
      line[c * 3 + 2] = blue
    }

    for (c in 0 until cols) {
      val left = max(0, c - 1)
      val right = min(cols - 1, c + 1)
      for (k in 0 until 3) {
        blurred[c * 3 + k] = (line[left * 3 + k] + 2 * line[c * 3 + k] + line[right * 3 + k]) * 0.25f
      }
    }

    var same = hasContent
    for (c in 0 until cols) {
      val red = blurred[c * 3].coerceIn(0f, 1f)
      val green = blurred[c * 3 + 1].coerceIn(0f, 1f)
      val blue = blurred[c * 3 + 2].coerceIn(0f, 1f)
      val offset = c * 4
      bytes[offset] = (red * 255).toInt()
      bytes[offset + 1] = (green * 255).toInt()
      bytes[offset + 2] = (blue * 255).toInt()
      bytes[offset + 3] = (maxOf(red, green, blue) * 255).toInt()
      if (same) {
        for (k in 0 until 4) {
          if (bytes[offset + k] != lastBytes[offset + k]) {
            same = false
            break
          }
        }
      }
    }

    if (same) return Result.Unchanged
    val count = cols * 4
    System.arraycopy(bytes, 0, lastBytes, 0, count)
    hasContent = true
    return Result.Updated(FloatArray(count) { bytes[it] * INV_255 })
  }

  private companion object {
    const val MAX_COLUMNS: Int = 160
    const val INV_255: Float = 1f / 255f
  }
}
