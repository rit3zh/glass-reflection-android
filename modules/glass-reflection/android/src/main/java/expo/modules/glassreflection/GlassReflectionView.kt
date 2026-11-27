package expo.modules.glassreflection

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.os.Build
import android.view.View
import android.view.animation.AnimationUtils
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.properties.Delegates
import kotlin.properties.ReadWriteProperty

class GlassReflectionView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val density: Float = resources.displayMetrics.density

  var fps: Double = 60.0
    set(value) {
      if (field == value) return
      field = value
      ReflectionCoordinator.viewConfigurationChanged()
      if (value <= 0) scheduleStaticSample()
    }
  var intensity: Float by layerProp(0.85f)
  var glow: Float by layerProp(0.1f)
  var refraction: Float by layerProp(10f)
  var rimWidth: Float by layerProp(1f)
  var cornerRadius: Float? by layerProp(null)
  var falloff: Float by layerProp(0.6f)
  var shine: Float by layerProp(0f)
  var shineWidth: Float by layerProp(0.3f)
  var baseRimColor: Int by layerProp(DEFAULT_BASE_RIM_COLOR)
  var sheen: Float by layerProp(1f)
  var innerShine: Float by layerProp(0f)
  var innerShineSpread: Float by layerProp(0.6f)
  var blur: Float by layerProp(2f)
  var tiltShine: Boolean = false
    set(value) {
      if (field == value) return
      field = value
      ReflectionCoordinator.viewConfigurationChanged()
      if (!value) updateShine(null)
    }
  var reflectBelow: Boolean = false
    set(value) {
      if (field == value) return
      field = value
      if (!value) {
        bottomEdge.apply(null, true, CROSS_FADE_LIVE_MS)
        invalidate()
      }
      bottomProcessor.reset()
      markLayersDirty()
    }
  var distance: Float = 180f
  var gap: Float = 0f
  var shimmer: Float by layerProp(0f)
  var shimmerDuration: Long by layerProp(700L)
  var shimmerInterval: Long by layerProp(3200L)
  val tuning: ReflectionTuning = ReflectionTuning()

  var lastSampleTime: Double = 0.0
  private var lastChangeTime: Double = 0.0

  private val topProcessor: EdgeProcessor = EdgeProcessor()
  private val bottomProcessor: EdgeProcessor = EdgeProcessor()
  private val topEdge: ReflectionEdge = ReflectionEdge(isTop = true)
  private val bottomEdge: ReflectionEdge = ReflectionEdge(isTop = false)
  private val shimmerSweep: ShimmerSweep = ShimmerSweep()
  private val shimmerTick: Runnable = Runnable { invalidate() }
  private val location: IntArray = IntArray(2)
  private val baseRimPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
  private val sheenPaint: Paint = Paint(Paint.FILTER_BITMAP_FLAG)
  private val bounds: RectF = RectF()
  private val frame: RectF = RectF()

  private var layersDirty: Boolean = true
  private var staticSampleScheduled: Boolean = false
  private var shinePosition: Float = 0.3f
  private var rimPath: Path? = null
  private var sheenBitmap: Bitmap? = null
  private var ringKey: List<Float>? = null
  private var haloKey: List<Float>? = null
  private var sheenKey: List<Float>? = null
  private var ringMask: Bitmap? = null
  private var haloMask: Bitmap? = null
  private var innerShineKey: List<Float>? = null
  private var innerShineMask: Bitmap? = null

  fun isSettled(now: Double): Boolean = now - lastChangeTime > ReflectionCoordinator.SETTLE_TIME

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    ReflectionCoordinator.register(this)
    lastSampleTime = 0.0
    updateShine(if (tiltShine) ReflectionCoordinator.tilt else null)
    if (fps <= 0) scheduleStaticSample()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    ReflectionCoordinator.unregister(this)
    removeCallbacks(shimmerTick)
    topProcessor.reset()
    bottomProcessor.reset()
    topEdge.apply(null, false, 0L)
    bottomEdge.apply(null, false, 0L)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) = Unit

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    markLayersDirty()
    if (fps <= 0) scheduleStaticSample()
  }

  override fun dispatchDraw(canvas: Canvas) {
    super.dispatchDraw(canvas)
    updateLayers()
    bounds.set(0f, 0f, width.toFloat(), height.toFloat())
    sheenBitmap?.let { canvas.drawBitmap(it, null, bounds, sheenPaint) }
    val path = rimPath
    if (path != null && rimWidth > 0f) {
      canvas.drawPath(path, baseRimPaint)
    }
    if (Build.VERSION.SDK_INT >= LIVE_REFLECTION_MIN_SDK) {
      val now = System.nanoTime()
      val bottomAnimating = bottomEdge.draw(canvas, now)
      val topAnimating = topEdge.draw(canvas, now)
      if (bottomAnimating || topAnimating) postInvalidateOnAnimation()
    }
    drawShimmer(canvas)
  }

  private fun drawShimmer(canvas: Canvas) {
    removeCallbacks(shimmerTick)
    if (!shimmerSweep.isActive || !motionEnabled()) return
    val now = AnimationUtils.currentAnimationTimeMillis()
    val wait = shimmerSweep.draw(canvas, now)
    if (wait == 0L) {
      postInvalidateOnAnimation()
      return
    }
    if (wait < 0L) return
    updateShimmerOffset()
    postDelayed(shimmerTick, wait)
  }

  private fun updateShimmerOffset() {
    val screenWidth = rootView.width
    if (screenWidth <= 0) return
    getLocationInWindow(location)
    val fraction = (location[0].toFloat() / screenWidth).coerceIn(0f, 1f)
    shimmerSweep.offsetMs = (fraction * shimmerSweep.durationMs * 0.5f).toLong()
  }

  private fun motionEnabled(): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.O || ValueAnimator.areAnimatorsEnabled()

  fun refresh() {
    ReflectionCoordinator.sample(listOf(this), System.nanoTime() / 1e9)
  }

  fun updateShine(tilt: Float?) {
    val target = tilt?.let { 0.32f + it * 0.55f } ?: 0.3f
    val clamped = target.coerceIn(0.06f, 0.94f)
    if (abs(clamped - shinePosition) <= 0.003f) return
    shinePosition = clamped
    if (applyShinePosition()) invalidate()
  }

  fun makeSampleRequest(): SampleRequest? {
    if (Build.VERSION.SDK_INT < LIVE_REFLECTION_MIN_SDK) return null
    if (!isAttachedToWindow || width < 1 || height < 1) return null
    val root: View = rootView
    if (!resolveFrame(root)) return null
    if (!frame.intersects(0f, 0f, root.width.toFloat(), root.height.toFloat())) return null
    val reach = max(8f, distance) * density
    val spacing = gap * density
    val above = RectF(frame.left, frame.top - spacing - reach, frame.right, frame.top - spacing)
    val below =
      if (reflectBelow) RectF(frame.left, frame.bottom + spacing, frame.right, frame.bottom + spacing + reach)
      else null
    val window = appContext.currentActivity?.window?.takeIf { it.peekDecorView() === root }
    return SampleRequest(root, window, above, below)
  }

  fun consume(capture: WindowCapture?, request: SampleRequest) {
    if (capture == null) {
      handle(topProcessor.clear(), topEdge)
      handle(bottomProcessor.clear(), bottomEdge)
      return
    }
    handle(topProcessor.process(capture, request.above, true, tuning, density), topEdge)
    val below = request.below ?: return
    handle(bottomProcessor.process(capture, below, false, tuning, density), bottomEdge)
  }

  private fun handle(result: EdgeProcessor.Result, edge: ReflectionEdge) {
    if (result !is EdgeProcessor.Result.Updated) return
    val now = System.nanoTime() / 1e9
    val wasSettled = isSettled(now)
    lastChangeTime = now
    edge.apply(result.row, wasSettled, if (fps > 0) CROSS_FADE_LIVE_MS else CROSS_FADE_STATIC_MS)
    invalidate()
  }

  private fun resolveFrame(root: View): Boolean {
    frame.set(0f, 0f, width.toFloat(), height.toFloat())
    var alpha = 1f
    var view: View = this
    while (true) {
      if (view.visibility != View.VISIBLE) return false
      alpha *= view.alpha
      if (!view.matrix.isIdentity) view.matrix.mapRect(frame)
      frame.offset(view.left.toFloat(), view.top.toFloat())
      if (view === root) break
      val parent = view.parent as? View ?: return false
      frame.offset(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
      view = parent
    }
    return alpha > 0.01f && frame.width() >= 1f && frame.height() >= 1f
  }

  private fun scheduleStaticSample() {
    if (staticSampleScheduled) return
    staticSampleScheduled = true
    post {
      staticSampleScheduled = false
      refresh()
    }
  }

  private fun markLayersDirty() {
    layersDirty = true
    invalidate()
  }

  private fun resolvedRadius(): Float {
    val maxRadius = min(width, height) / 2f
    val radius = cornerRadius?.takeIf { it >= 0f }?.times(density) ?: return maxRadius
    return min(radius, maxRadius)
  }

  private fun updateLayers() {
    if (!layersDirty) return
    layersDirty = false

    val w = width.toFloat()
    val h = height.toFloat()
    val radius = resolvedRadius()
    val lineWidth = max(0f, rimWidth) * density
    val path = ReflectionMasks.strokePath(w, h, radius, lineWidth)
    rimPath = path

    baseRimPaint.strokeWidth = lineWidth
    val alpha = Color.alpha(baseRimColor)
    baseRimPaint.shader = if (h > 0f) {
      LinearGradient(
        0f, 0f, 0f, h,
        intArrayOf(
          baseRimColor,
          withAlpha(baseRimColor, alpha * 0.45f),
          withAlpha(baseRimColor, alpha * 0.55f)
        ),
        floatArrayOf(0f, 0.55f, 1f),
        Shader.TileMode.CLAMP
      )
    } else {
      null
    }

    val widthPt = w / density
    val heightPt = h / density
    val radiusPt = radius / density
    val depth = if (glow > 0f) max(2f, refraction) else 0f
    val nextRingKey = listOf(widthPt, heightPt, radiusPt, depth)
    if (ringKey != nextRingKey) {
      ringKey = nextRingKey
      ringMask = if (depth > 0f) ReflectionMasks.ring(widthPt, heightPt, radiusPt, depth) else null
    }

    val haloBlur = max(0f, blur)
    val rimWidthPt = max(0f, rimWidth)
    val nextHaloKey = listOf(widthPt, heightPt, radiusPt, haloBlur, rimWidthPt)
    if (haloKey != nextHaloKey) {
      haloKey = nextHaloKey
      haloMask =
        if (haloBlur > 0f) ReflectionMasks.halo(widthPt, heightPt, radiusPt, rimWidthPt, haloBlur) else null
    }

    val sheenStrength = max(0f, sheen)
    val nextSheenKey = listOf(w, h, radius, sheenStrength)
    if (sheenKey != nextSheenKey) {
      sheenKey = nextSheenKey
      sheenBitmap =
        if (sheenStrength > 0f) ReflectionMasks.sheen(width, height, radius, sheenStrength, density) else null
    }

    val shineStrength = max(0f, innerShine)
    val nextInnerShineKey = listOf(widthPt, heightPt, radiusPt, innerShineSpread)
    if (shineStrength <= 0f) {
      innerShineKey = null
      innerShineMask = null
    } else if (innerShineKey != nextInnerShineKey) {
      innerShineKey = nextInnerShineKey
      innerShineMask = ReflectionMasks.innerShine(widthPt, heightPt, radiusPt, innerShineSpread)
    }

    val fade = falloff.coerceIn(0.05f, 1f)
    val strength = max(0f, intensity)
    val wash = strength * glow.coerceIn(0f, 1f)
    val highlight = max(0f, shine)
    topEdge.layout(w, h, path, lineWidth, fade, strength, wash, highlight, density)
    bottomEdge.layout(
      w, h, path, lineWidth, fade * 0.75f,
      if (reflectBelow) strength else 0f,
      if (reflectBelow) wash else 0f,
      highlight * 0.4f,
      density
    )
    topEdge.setMasks(haloMask, ringMask, density)
    topEdge.setInnerShine(innerShineMask, shineStrength * INNER_SHINE_OPACITY, density)
    bottomEdge.setMasks(haloMask, ringMask, density)
    shimmerSweep.strength = max(0f, shimmer)
    shimmerSweep.durationMs = shimmerDuration
    shimmerSweep.intervalMs = shimmerInterval
    shimmerSweep.layout(w, h, radius, path, lineWidth, density)
    applyShinePosition()
  }

  private fun applyShinePosition(): Boolean {
    if (shine <= 0f) return false
    val width = shineWidth.coerceIn(0.05f, 0.5f)
    topEdge.setShine(shinePosition, width)
    bottomEdge.setShine(1f - shinePosition, width * 0.8f)
    return true
  }

  private fun <T> layerProp(initial: T): ReadWriteProperty<Any?, T> =
    Delegates.observable(initial) { _, old, new -> if (old != new) markLayersDirty() }

  private fun withAlpha(color: Int, alpha: Float): Int =
    Color.argb(alpha.toInt().coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))

  companion object {
    const val LIVE_REFLECTION_MIN_SDK: Int = Build.VERSION_CODES.P
    val DEFAULT_BASE_RIM_COLOR: Int = Color.argb(23, 255, 255, 255)
    private const val INNER_SHINE_OPACITY: Float = 0.35f
    private const val CROSS_FADE_LIVE_MS: Long = 100L
    private const val CROSS_FADE_STATIC_MS: Long = 300L
  }
}
