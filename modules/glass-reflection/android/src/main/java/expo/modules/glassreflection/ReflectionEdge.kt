package expo.modules.glassreflection

import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ComposeShader
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.Shader
import kotlin.math.roundToInt

class ReflectionEdge(private val isTop: Boolean) {
  private val rimPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
  private val shinePaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
  private val haloPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
  private val washPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
  private val innerShinePaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)

  private var width: Float = 0f
  private var height: Float = 0f
  private var path: Path? = null
  private var fade: Shader? = null
  private var haloMask: Shader? = null
  private var washMask: Shader? = null
  private var innerShineMask: Shader? = null
  private var innerShineMaskBitmap: Bitmap? = null
  private var rimOpacity: Float = 0f
  private var washOpacity: Float = 0f
  private var shineOpacity: Float = 0f
  private var shineCenter: Float = 0.3f
  private var shineWidth: Float = 0.3f

  private var shown: FloatArray? = null
  private var from: FloatArray? = null
  private var to: FloatArray? = null
  private var fadeStart: Long = 0L
  private var fadeDuration: Long = 0L
  private var colorsDirty: Boolean = true

  fun setMasks(halo: Bitmap?, ring: Bitmap?, density: Float) {
    haloMask = halo?.let { maskShader(it, density) }
    washMask = ring?.let { maskShader(it, density) }
    colorsDirty = true
  }

  fun setInnerShine(mask: Bitmap?, opacity: Float, density: Float) {
    innerShinePaint.alpha = alphaOf(opacity)
    if (mask === innerShineMaskBitmap) return
    innerShineMaskBitmap = mask
    innerShineMask = mask?.let { maskShader(it, density) }
    colorsDirty = true
  }

  fun layout(
    width: Float,
    height: Float,
    path: Path?,
    lineWidth: Float,
    falloff: Float,
    rimOpacity: Float,
    washOpacity: Float,
    shineOpacity: Float,
    density: Float
  ) {
    this.width = width
    this.height = height
    this.path = path
    this.rimOpacity = rimOpacity
    this.washOpacity = washOpacity
    this.shineOpacity = shineOpacity

    rimPaint.strokeWidth = lineWidth
    rimPaint.alpha = alphaOf(rimOpacity)
    haloPaint.alpha = alphaOf(rimOpacity * 0.4f)
    washPaint.alpha = alphaOf(washOpacity)
    shinePaint.strokeWidth = lineWidth + 0.5f * density
    shinePaint.alpha = alphaOf(shineOpacity)

    val solid = Color.WHITE
    val clear = Color.argb(0, 255, 255, 255)
    fade = if (height > 0) {
      if (isTop) {
        LinearGradient(
          0f, 0f, 0f, height,
          intArrayOf(solid, solid, clear),
          floatArrayOf(0f, falloff * 0.3f, falloff),
          Shader.TileMode.CLAMP
        )
      } else {
        LinearGradient(
          0f, 0f, 0f, height,
          intArrayOf(clear, solid, solid),
          floatArrayOf(1f - falloff, 1f - falloff * 0.3f, 1f),
          Shader.TileMode.CLAMP
        )
      }
    } else {
      null
    }
    colorsDirty = true
    rebuildShine()
  }

  fun setShine(center: Float, width: Float) {
    shineCenter = center
    shineWidth = width
    rebuildShine()
  }

  fun apply(row: FloatArray?, animated: Boolean, durationMs: Long) {
    if (animated && (shown != null || row != null)) {
      from = shown
      to = row
      fadeStart = System.nanoTime()
      fadeDuration = durationMs * 1_000_000L
    } else {
      shown = row
      from = null
      to = null
      fadeDuration = 0L
    }
    colorsDirty = true
  }

  fun draw(canvas: Canvas, now: Long): Boolean {
    var animating = false
    if (fadeDuration > 0L) {
      val progress = ((now - fadeStart).toFloat() / fadeDuration).coerceIn(0f, 1f)
      if (progress >= 1f) {
        shown = to
        from = null
        to = null
        fadeDuration = 0L
      } else {
        shown = blend(from, to, progress)
        animating = true
      }
      colorsDirty = true
    }
    if (colorsDirty) {
      colorsDirty = false
      rebuildColors()
    }

    val stroke = path ?: return animating
    if (shown != null) {
      if (innerShinePaint.alpha > 0 && innerShinePaint.shader != null) {
        canvas.drawRect(0f, 0f, width, height, innerShinePaint)
      }
      if (washOpacity > 0f && washPaint.shader != null) {
        canvas.drawRect(0f, 0f, width, height, washPaint)
      }
      if (haloPaint.shader != null) {
        canvas.drawRect(0f, 0f, width, height, haloPaint)
      }
      if (rimOpacity > 0f && rimPaint.shader != null) {
        canvas.drawPath(stroke, rimPaint)
      }
    }
    if (shineOpacity > 0f && shinePaint.shader != null) {
      canvas.drawPath(stroke, shinePaint)
    }
    return animating
  }

  private fun rebuildColors() {
    val row = shown
    val mask = fade
    if (row == null || mask == null || width <= 0f) {
      rimPaint.shader = null
      haloPaint.shader = null
      washPaint.shader = null
      innerShinePaint.shader = null
      return
    }
    val colors = colorShader(row)
    innerShinePaint.shader = innerShineMask?.let { ComposeShader(colors, it, PorterDuff.Mode.DST_IN) }
    rimPaint.shader = ComposeShader(colors, mask, PorterDuff.Mode.DST_IN)
    haloPaint.shader = haloMask?.let {
      ComposeShader(ComposeShader(colors, it, PorterDuff.Mode.DST_IN), mask, PorterDuff.Mode.DST_IN)
    }
    washPaint.shader = washMask?.let {
      ComposeShader(ComposeShader(colors, it, PorterDuff.Mode.DST_IN), mask, PorterDuff.Mode.DST_IN)
    }
  }

  private fun rebuildShine() {
    val mask = fade
    if (mask == null || width <= 0f) {
      shinePaint.shader = null
      return
    }
    val clear = Color.argb(0, 255, 255, 255)
    val mid = Color.argb(128, 255, 255, 255)
    val gradient = LinearGradient(
      (shineCenter - shineWidth) * width, 0f,
      (shineCenter + shineWidth) * width, 0f,
      intArrayOf(clear, mid, Color.WHITE, mid, clear),
      floatArrayOf(0f, 0.275f, 0.5f, 0.725f, 1f),
      Shader.TileMode.CLAMP
    )
    shinePaint.shader = ComposeShader(gradient, mask, PorterDuff.Mode.DST_IN)
  }

  private fun colorShader(row: FloatArray): Shader {
    val cols = row.size / 4
    val colors = IntArray(cols)
    val positions = FloatArray(cols) { (it + 0.5f) / cols }
    var lastRed = 0
    var lastGreen = 0
    var lastBlue = 0
    var firstLit = -1
    for (c in 0 until cols) {
      val alpha = row[c * 4 + 3]
      if (alpha > 1e-4f) {
        lastRed = ((row[c * 4] / alpha).coerceIn(0f, 1f) * 255).roundToInt()
        lastGreen = ((row[c * 4 + 1] / alpha).coerceIn(0f, 1f) * 255).roundToInt()
        lastBlue = ((row[c * 4 + 2] / alpha).coerceIn(0f, 1f) * 255).roundToInt()
        if (firstLit < 0) firstLit = c
        colors[c] = Color.argb((alpha * 255).roundToInt(), lastRed, lastGreen, lastBlue)
      } else {
        colors[c] = Color.argb(0, lastRed, lastGreen, lastBlue)
      }
    }
    if (firstLit > 0) {
      val seed = colors[firstLit] and 0x00FFFFFF
      for (c in 0 until firstLit) colors[c] = seed
    }
    return LinearGradient(0f, 0f, width, 0f, colors, positions, Shader.TileMode.CLAMP)
  }

  private fun maskShader(bitmap: Bitmap, density: Float): Shader =
    BitmapShader(bitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP).apply {
      setLocalMatrix(Matrix().apply { setScale(density, density) })
    }

  private fun blend(start: FloatArray?, end: FloatArray?, progress: Float): FloatArray? {
    if (start == null && end == null) return null
    val size = end?.size ?: start!!.size
    if (start != null && end != null && start.size != end.size) return end
    return FloatArray(size) {
      val a = start?.get(it) ?: 0f
      val b = end?.get(it) ?: 0f
      a + (b - a) * progress
    }
  }

  private fun alphaOf(opacity: Float): Int = (opacity.coerceIn(0f, 1f) * 255).roundToInt()
}
