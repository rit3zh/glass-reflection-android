package expo.modules.glassreflection

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Rect
import android.graphics.RectF
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.view.Choreographer
import android.view.PixelCopy
import android.view.View
import android.view.Window
import java.util.Collections
import java.util.WeakHashMap
import java.util.concurrent.Executor
import kotlin.math.min

object ReflectionCoordinator : Choreographer.FrameCallback, SensorEventListener {
  const val SETTLE_TIME: Double = 0.4
  private const val IDLE_FPS: Double = 15.0
  private const val MOTION_INTERVAL_US: Int = 33_333

  private val views: MutableSet<GlassReflectionView> = Collections.newSetFromMap(WeakHashMap())
  private val pending: MutableSet<GlassReflectionView> = Collections.newSetFromMap(WeakHashMap())
  private val capture: WindowCapture = WindowCapture()
  private val mainHandler: Handler = Handler(Looper.getMainLooper())
  private val mainExecutor: Executor = Executor { mainHandler.post(it) }
  private var worker: Handler? = null

  private var isTicking: Boolean = false
  private var isAppActive: Boolean = true
  private var inFlight: Boolean = false

  private var sensorManager: SensorManager? = null
  private var isMotionRunning: Boolean = false
  var tilt: Float = 0f
    private set

  private var isPaused: Boolean = false

  fun register(view: GlassReflectionView) {
    views.add(view)
    update()
  }

  fun unregister(view: GlassReflectionView) {
    views.remove(view)
    pending.remove(view)
    update()
  }

  fun viewConfigurationChanged() {
    update()
  }

  fun setAppActive(active: Boolean) {
    mainHandler.post {
      isAppActive = active
      update()
    }
  }

  fun setPaused(paused: Boolean) {
    mainHandler.post {
      isPaused = paused
      update()
    }
  }

  fun sample(targets: Collection<GlassReflectionView>, now: Double) {
    if (inFlight) {
      pending.addAll(targets)
      return
    }
    val groups = LinkedHashMap<View, MutableList<Pair<GlassReflectionView, SampleRequest>>>()
    for (view in targets) {
      view.lastSampleTime = now
      val request = view.makeSampleRequest() ?: continue
      groups.getOrPut(request.root) { mutableListOf() }.add(view to request)
    }
    if (groups.isEmpty()) return
    inFlight = true
    captureNext(ArrayDeque(groups.values))
  }

  override fun doFrame(frameTimeNanos: Long) {
    if (!isTicking) return
    Choreographer.getInstance().postFrameCallback(this)
    if (inFlight) return
    val now = frameTimeNanos / 1e9
    val live = views.filter { it.fps > 0 }
    if (live.isEmpty()) return
    val due = live.any { now - it.lastSampleTime >= interval(it, now) * 0.9 }
    if (!due) return
    sample(live.filter { now - it.lastSampleTime >= interval(it, now) * 0.5 }, now)
  }

  override fun onSensorChanged(event: SensorEvent) {
    val target = (-event.values[0] / SensorManager.GRAVITY_EARTH * 1.6f).coerceIn(-1f, 1f)
    tilt += (target - tilt) * 0.18f
    for (view in views.toList()) {
      if (view.tiltShine) view.updateShine(tilt)
    }
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

  private fun interval(view: GlassReflectionView, now: Double): Double =
    if (view.isSettled(now)) 1.0 / min(view.fps, IDLE_FPS) else 1.0 / view.fps

  private fun captureNext(queue: ArrayDeque<MutableList<Pair<GlassReflectionView, SampleRequest>>>) {
    val group = queue.removeFirstOrNull()
    if (group == null) {
      finish()
      return
    }
    val first = group.first().second
    val root = first.root
    val union = RectF(first.above)
    for ((_, request) in group) {
      union.union(request.above)
      request.below?.let { union.union(it) }
    }
    val region = Rect()
    union.roundOut(region)
    if (!region.intersect(0, 0, root.width, root.height) || region.isEmpty) {
      deliver(group, null)
      captureNext(queue)
      return
    }
    val bitmap = capture.prepare(region, root.resources.displayMetrics.density)
    copy(root, first.window, region, bitmap) { success ->
      if (success) capture.read()
      deliver(group, if (success) capture else null)
      captureNext(queue)
    }
  }

  private fun deliver(group: List<Pair<GlassReflectionView, SampleRequest>>, result: WindowCapture?) {
    for ((view, request) in group) {
      if (view.isAttachedToWindow) view.consume(result, request)
    }
  }

  private fun finish() {
    inFlight = false
    if (pending.isEmpty()) return
    val next = pending.toList()
    pending.clear()
    sample(next, System.nanoTime() / 1e9)
  }

  private fun copy(
    root: View,
    window: Window?,
    region: Rect,
    bitmap: Bitmap,
    completion: (Boolean) -> Unit
  ) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      try {
        val request = PixelCopy.Request.Builder.ofWindow(root)
          .setSourceRect(region)
          .setDestinationBitmap(bitmap)
          .build()
        PixelCopy.request(request, mainExecutor) { result -> completion(result.status == PixelCopy.SUCCESS) }
      } catch (error: RuntimeException) {
        mainHandler.post { completion(false) }
      }
      return
    }
    if (window == null) {
      mainHandler.post { completion(false) }
      return
    }
    workerHandler().post {
      try {
        PixelCopy.request(window, region, bitmap, { status -> completion(status == PixelCopy.SUCCESS) }, mainHandler)
      } catch (error: RuntimeException) {
        mainHandler.post { completion(false) }
      }
    }
  }

  private fun workerHandler(): Handler =
    worker ?: Handler(HandlerThread("GlassReflectionCapture").apply { start() }.looper).also { worker = it }

  private fun update() {
    val all = views.toList()
    val active = isAppActive && !isPaused
    val shouldTick = active && all.any { it.fps > 0 }
    val choreographer = Choreographer.getInstance()
    if (shouldTick && !isTicking) {
      isTicking = true
      choreographer.postFrameCallback(this)
    } else if (!shouldTick && isTicking) {
      isTicking = false
      choreographer.removeFrameCallback(this)
    }

    val wantsMotion = active && all.any { it.tiltShine }
    if (wantsMotion && !isMotionRunning) {
      startMotion(all.first().context)
    } else if (!wantsMotion && isMotionRunning) {
      sensorManager?.unregisterListener(this)
      isMotionRunning = false
    }
  }

  private fun startMotion(context: Context) {
    val manager = sensorManager
      ?: (context.applicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager)
        ?.also { sensorManager = it }
      ?: return
    val sensor = manager.getDefaultSensor(Sensor.TYPE_GRAVITY)
      ?: manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
      ?: return
    isMotionRunning = manager.registerListener(this, sensor, MOTION_INTERVAL_US, mainHandler)
  }
}
