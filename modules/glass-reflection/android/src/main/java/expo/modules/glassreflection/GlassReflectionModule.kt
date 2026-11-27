package expo.modules.glassreflection

import android.graphics.Color
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GlassReflectionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("GlassReflection")

    Function("setPaused") { paused: Boolean ->
      ReflectionCoordinator.setPaused(paused)
    }

    OnActivityEntersForeground {
      ReflectionCoordinator.setAppActive(true)
    }

    OnActivityEntersBackground {
      ReflectionCoordinator.setAppActive(false)
    }

    View(GlassReflectionView::class) {
      Prop("fps", 60.0) { view: GlassReflectionView, value: Double ->
        view.fps = value.coerceIn(0.0, 120.0)
      }
      Prop("intensity", 0.85) { view: GlassReflectionView, value: Double ->
        view.intensity = value.toFloat().coerceAtLeast(0f)
      }
      Prop("glow", 0.1) { view: GlassReflectionView, value: Double ->
        view.glow = value.toFloat()
      }
      Prop("refraction", 10.0) { view: GlassReflectionView, value: Double ->
        view.refraction = value.toFloat().coerceAtLeast(2f)
      }
      Prop("rimWidth", 1.0) { view: GlassReflectionView, value: Double ->
        view.rimWidth = value.toFloat().coerceAtLeast(0f)
      }
      Prop("cornerRadius") { view: GlassReflectionView, value: Double? ->
        view.cornerRadius = value?.toFloat()
      }
      Prop("falloff", 0.6) { view: GlassReflectionView, value: Double ->
        view.falloff = value.toFloat()
      }
      Prop("shine", 0.0) { view: GlassReflectionView, value: Double ->
        view.shine = value.toFloat().coerceAtLeast(0f)
      }
      Prop("shineWidth", 0.3) { view: GlassReflectionView, value: Double ->
        view.shineWidth = value.toFloat()
      }
      Prop("tiltShine", false) { view: GlassReflectionView, value: Boolean ->
        view.tiltShine = value
      }
      Prop("baseRimColor") { view: GlassReflectionView, value: Color? ->
        view.baseRimColor = value?.toArgb() ?: GlassReflectionView.DEFAULT_BASE_RIM_COLOR
      }
      Prop("sheen", 1.0) { view: GlassReflectionView, value: Double ->
        view.sheen = value.toFloat().coerceAtLeast(0f)
      }
      Prop("innerShine", 0.0) { view: GlassReflectionView, value: Double ->
        view.innerShine = value.toFloat().coerceAtLeast(0f)
      }
      Prop("innerShineSpread", 0.6) { view: GlassReflectionView, value: Double ->
        view.innerShineSpread = value.toFloat().coerceIn(0.05f, 1f)
      }
      Prop("blur", 2.0) { view: GlassReflectionView, value: Double ->
        view.blur = value.toFloat().coerceIn(0f, 20f)
      }
      Prop("distance", 180.0) { view: GlassReflectionView, value: Double ->
        view.distance = value.toFloat().coerceAtLeast(8f)
      }
      Prop("gap", 0.0) { view: GlassReflectionView, value: Double ->
        view.gap = value.toFloat()
      }
      Prop("reflectBelow", false) { view: GlassReflectionView, value: Boolean ->
        view.reflectBelow = value
      }
      Prop("saturation", 1.0) { view: GlassReflectionView, value: Double ->
        view.tuning.saturation = value.toFloat().coerceAtLeast(0f)
      }
      Prop("brightness", 1.0) { view: GlassReflectionView, value: Double ->
        view.tuning.brightness = value.toFloat().coerceAtLeast(0f)
      }
      Prop("shimmer", 0.0) { view: GlassReflectionView, value: Double ->
        view.shimmer = value.toFloat().coerceAtLeast(0f)
      }
      Prop("shimmerDuration", 700.0) { view: GlassReflectionView, value: Double ->
        view.shimmerDuration = value.toLong().coerceAtLeast(100L)
      }
      Prop("shimmerInterval", 3200.0) { view: GlassReflectionView, value: Double ->
        view.shimmerInterval = value.toLong().coerceAtLeast(0L)
      }
      Prop("captureMode", "layer") { _: GlassReflectionView, _: String -> }

      AsyncFunction("refresh") { view: GlassReflectionView ->
        view.refresh()
      }.runOnQueue(Queues.MAIN)
    }
  }
}
