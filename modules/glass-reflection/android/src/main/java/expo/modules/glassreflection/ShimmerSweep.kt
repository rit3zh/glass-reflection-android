package expo.modules.glassreflection

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.view.animation.PathInterpolator
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.tan

/**
 * A soft band of light that sweeps across the glass every few seconds: faint over the surface,
 * brighter where it crosses the rim. One gradient shader moved by a matrix, so a frame costs two
 * path draws; between sweeps nothing is drawn and the view isn't invalidated at all.
 */
class ShimmerSweep {
  private val fillPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG)
  private val rimPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
  private val fillPath: Path = Path()
  private val matrix: Matrix = Matrix()
  private val ease: PathInterpolator = PathInterpolator(0.4f, 0f, 0.2f, 1f)
  private var gradient: LinearGradient? = null
  private var rimPath: Path? = null
  private var width: Float = 0f
  private var height: Float = 0f
  private var travel: Float = 0f

  var strength: Float = 0f
  var durationMs: Long = 700L
  var intervalMs: Long = 3200L
  var offsetMs: Long = 0L

  val isActive: Boolean
    get() = strength > 0f && gradient != null

  fun layout(w: Float, h: Float, radius: Float, rim: Path?, lineWidth: Float, density: Float) {
    width = w
    height = h
    rimPath = rim
    fillPath.reset()
    if (w < 1f || h < 1f || strength <= 0f) {
      gradient = null
      return
    }
    fillPath.addRoundRect(0f, 0f, w, h, radius, radius, Path.Direction.CW)
    val band = max(h * 0.9f, w * 0.28f)
    travel = h * tan(ANGLE_RAD) + band
    val clear = Color.argb(0, 255, 255, 255)
    val half = Color.argb(115, 255, 255, 255)
    val shader = LinearGradient(
      -band / 2f, 0f, band / 2f, 0f,
      intArrayOf(clear, half, Color.WHITE, half, clear),
      floatArrayOf(0f, 0.3f, 0.5f, 0.7f, 1f),
      Shader.TileMode.CLAMP
    )
    gradient = shader
    fillPaint.shader = shader
    rimPaint.shader = shader
    rimPaint.strokeWidth = lineWidth + 0.5f * density
    val k = min(1f, strength)
    fillPaint.alpha = (k * 0.14f * 255f).roundToInt().coerceIn(0, 255)
    rimPaint.alpha = (k * 255f).roundToInt().coerceIn(0, 255)
  }

  /** Draws the band if a sweep is under way. Returns 0 while sweeping, else ms until the next one. */
  fun draw(canvas: Canvas, nowMs: Long): Long {
    val shader = gradient ?: return -1L
    val duration = max(100L, durationMs)
    val total = duration + max(0L, intervalMs)
    val phase = (nowMs - offsetMs).mod(total)
    if (phase >= duration) return total - phase
    val t = ease.getInterpolation(phase.toFloat() / duration)
    val x = -travel + (width + travel * 2f) * t
    matrix.setRotate(ANGLE_DEG)
    matrix.postTranslate(x, height / 2f)
    shader.setLocalMatrix(matrix)
    canvas.drawPath(fillPath, fillPaint)
    rimPath?.let { canvas.drawPath(it, rimPaint) }
    return 0L
  }

  companion object {
    private const val ANGLE_RAD: Float = 0.36f
    private const val ANGLE_DEG: Float = ANGLE_RAD * 57.29578f
  }
}
