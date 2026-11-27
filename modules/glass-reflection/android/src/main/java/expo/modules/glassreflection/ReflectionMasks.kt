package expo.modules.glassreflection

import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Shader
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

object ReflectionMasks {
  fun roundedRect(left: Float, top: Float, right: Float, bottom: Float, radius: Float): Path =
    Path().apply { addRoundRect(left, top, right, bottom, radius, radius, Path.Direction.CW) }

  fun strokePath(width: Float, height: Float, radius: Float, lineWidth: Float): Path? {
    val inset = lineWidth / 2
    val strokeWidth = width - inset * 2
    val strokeHeight = height - inset * 2
    if (strokeWidth <= 0 || strokeHeight <= 0) return null
    val strokeRadius = max(0f, min(radius - inset, min(strokeWidth, strokeHeight) / 2))
    return roundedRect(inset, inset, width - inset, height - inset, strokeRadius)
  }

  fun ring(width: Float, height: Float, radius: Float, depth: Float): Bitmap? {
    val bitmap = createMask(width, height) ?: return null
    val canvas = Canvas(bitmap)
    canvas.clipPath(roundedRect(0f, 0f, width, height, radius))
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      maskFilter = blurFilter(depth / 2)
    }
    canvas.drawPath(frame(width, height, radius, depth * 4), paint)
    return bitmap
  }

  fun halo(width: Float, height: Float, radius: Float, lineWidth: Float, blur: Float): Bitmap? {
    val path = strokePath(width, height, radius, lineWidth) ?: return null
    val bitmap = createMask(width, height) ?: return null
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = max(1f, lineWidth)
      color = Color.WHITE
      maskFilter = blurFilter(blur)
    }
    canvas.drawPath(path, paint)
    paint.maskFilter = null
    canvas.drawPath(path, paint)
    return bitmap
  }

  fun innerShine(width: Float, height: Float, radius: Float, spread: Float): Bitmap? {
    val bitmap = createMask(width, height) ?: return null
    val canvas = Canvas(bitmap)
    canvas.clipPath(roundedRect(0f, 0f, width, height, radius))
    val reach = spread.coerceIn(0.05f, 1f)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      shader = LinearGradient(
        0f, 0f, 0f, height,
        intArrayOf(Color.WHITE, Color.argb(115, 255, 255, 255), Color.argb(36, 255, 255, 255), Color.TRANSPARENT),
        floatArrayOf(0f, reach * 0.35f, reach * 0.7f, reach),
        Shader.TileMode.CLAMP
      )
    }
    canvas.drawRect(0f, 0f, width, height, paint)
    return bitmap
  }

  fun sheen(width: Int, height: Int, radius: Float, strength: Float, density: Float): Bitmap? {
    if (width < 1 || height < 1) return null
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val w = width.toFloat()
    val h = height.toFloat()
    val k = min(strength, 2f)
    canvas.clipPath(roundedRect(0f, 0f, w, h, radius))

    val gloss = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      shader = LinearGradient(
        0f, 0f, 0f, h,
        intArrayOf(white(0.045f, k), white(0.012f, k), white(0f, k)),
        floatArrayOf(0f, 0.3f, 0.55f),
        Shader.TileMode.CLAMP
      )
    }
    canvas.drawRect(0f, 0f, w, h, gloss)

    innerRing(
      canvas, w, h, radius,
      color = white(0.2f, k),
      blur = 1.5f * density,
      fade = floatArrayOf(1f, 0.15f, 0f),
      locations = floatArrayOf(0f, 0.16f, 0.38f)
    )
    innerRing(
      canvas, w, h, radius,
      color = black(0.4f, k),
      blur = min(10f, h / density * 0.2f) * density,
      fade = floatArrayOf(0f, 0f, 1f),
      locations = floatArrayOf(0f, 0.5f, 1f)
    )
    return bitmap
  }

  private fun innerRing(
    canvas: Canvas,
    width: Float,
    height: Float,
    radius: Float,
    color: Int,
    blur: Float,
    fade: FloatArray,
    locations: FloatArray
  ) {
    canvas.saveLayer(null, null)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      this.color = color
      maskFilter = blurFilter(blur / 2)
    }
    canvas.drawPath(frame(width, height, radius, blur * 4), paint)
    val mask = Paint().apply {
      shader = LinearGradient(
        0f, 0f, 0f, height,
        IntArray(fade.size) { Color.argb((fade[it] * 255).toInt(), 255, 255, 255) },
        locations,
        Shader.TileMode.CLAMP
      )
      xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
    }
    canvas.drawRect(0f, 0f, width, height, mask)
    canvas.restore()
  }

  private fun frame(width: Float, height: Float, radius: Float, outset: Float): Path =
    Path().apply {
      fillType = Path.FillType.EVEN_ODD
      addRect(-outset, -outset, width + outset, height + outset, Path.Direction.CW)
      addRoundRect(0f, 0f, width, height, radius, radius, Path.Direction.CW)
    }

  private fun createMask(width: Float, height: Float): Bitmap? {
    if (width < 1 || height < 1) return null
    return Bitmap.createBitmap(ceil(width).toInt(), ceil(height).toInt(), Bitmap.Config.ARGB_8888)
  }

  private fun blurFilter(sigma: Float): BlurMaskFilter =
    BlurMaskFilter(max(0.1f, (sigma - 0.5f) / 0.57735f), BlurMaskFilter.Blur.NORMAL)

  private fun white(alpha: Float, k: Float): Int =
    Color.argb((min(1f, alpha * k) * 255).toInt(), 255, 255, 255)

  private fun black(alpha: Float, k: Float): Int =
    Color.argb((min(1f, alpha * k) * 255).toInt(), 0, 0, 0)
}
