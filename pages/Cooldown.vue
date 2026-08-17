<template>
  <div class="page">
    <div class="card">
      <h1>⏳ Claude Cooldown Planner</h1>
      <p class="subtitle">
        Track your 5-hour cooldown and plan usage
      </p>

      <label>Last Usage Time</label>

      <input
        v-model="usageTime"
        type="time"
      />

      <button class="primary" @click="calculateCooldown">
        Calculate Cooldown
      </button>

      <button class="success" @click="useNow">
        🚀 Use Now
      </button>

      <div class="result">
        <div class="label">Next Available Time</div>
        <div class="next-time">
          {{ nextAvailableTime || '--:--' }}
        </div>

        <div class="countdown">
          {{ countdown }}
        </div>
      </div>

      <div class="planner">
        <h3>💡 Usage Planner</h3>

        <p>
          Want your cooldown to finish at a specific time?
          Simply subtract 5 hours.
        </p>

        <div class="example">
          <strong>Example</strong><br /><br />
          Cooldown Ends: <strong>9:30 PM</strong><br />
          Use Claude At: <strong>4:30 PM</strong>
        </div>

        <p class="formula">
          <strong>Formula:</strong><br />
          Use Time = End Time − 5 Hours
        </p>

        <div class="tip">
          🎯 Example: To finish cooldown at 9:30 PM, start at 4:30 PM.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const usageTime = ref('')
const nextAvailableTime = ref('')
const countdown = ref('')

let timer = null

function useNow() {
  const now = new Date()

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  usageTime.value = `${hh}:${mm}`

  calculateCooldown()
}

function calculateCooldown() {
  if (!usageTime.value) return

  const [hours, minutes] = usageTime.value.split(':')

  const start = new Date()
  start.setHours(Number(hours))
  start.setMinutes(Number(minutes))
  start.setSeconds(0)

  const cooldownEnd = new Date(
    start.getTime() + 5 * 60 * 60 * 1000
  )

  nextAvailableTime.value = cooldownEnd.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  if (timer) {
    clearInterval(timer)
  }

  const updateCountdown = () => {
    const now = new Date()
    const diff = cooldownEnd - now

    if (diff <= 0) {
      countdown.value = '✅ Cooldown Finished'
      clearInterval(timer)
      return
    }

    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)

    countdown.value = `${h}h ${m}m ${s}s remaining`
  }

  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
}

onMounted(() => {
  useNow()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
}

.card {
  width: 100%;
  max-width: 520px;
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  color: white;
}

h1 {
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #cbd5e1;
}

input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  margin-bottom: 16px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.primary {
  background: #3b82f6;
  color: white;
}

.primary:hover {
  background: #2563eb;
}

.success {
  background: #22c55e;
  color: white;
  margin-top: 10px;
}

.success:hover {
  background: #16a34a;
}

.result {
  margin-top: 28px;
  text-align: center;
}

.label {
  color: #94a3b8;
}

.next-time {
  font-size: 2rem;
  font-weight: 700;
  color: #22c55e;
  margin-top: 10px;
}

.countdown {
  margin-top: 15px;
  font-size: 1.2rem;
  font-weight: 700;
}

.planner {
  margin-top: 24px;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(59, 130, 246, 0.15)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.planner h3 {
  margin-bottom: 10px;
  color: #22c55e;
}

.planner p {
  color: #cbd5e1;
  line-height: 1.6;
}

.example {
  margin: 12px 0;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.formula {
  color: #94a3b8;
}

.tip {
  margin-top: 12px;
  color: #fbbf24;
}
</style>
