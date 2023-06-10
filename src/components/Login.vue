<template>
	<div>
		<v-card variant="text">
			<v-form v-if="!state.showOpeningScreen" @submit.prevent>
				<template v-if="state.userEntryMode === 'login'">
					<v-card-title class="text-h5">login</v-card-title>
					<v-card-subtitle>Login met uw alias en PIN code</v-card-subtitle>
					<v-text-field v-model.trim="state.aliasSelected" label="Uw alias" :rules="state.nameRules" />
				</template>
			</v-form>
		</v-card>
	</div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const state = reactive({
  showOpeningScreen: true,
  alert: false,
  aliasSelected: '',
  nameRules: [
    value => {
      if (state.assignedUserIds.includes(value.toUpperCase())) return true

      return 'Alias onbekend.'
    },
  ],
  PIN: '',
  pinRules: [
    value => {
      if (value) return true

      return 'Vul 4 of meer cijfers in.'
    },
    value => {
      if (!isNaN(value)) return true

      return 'Vul alleen cijfers in.'
    },
    value => {
      if (value.length >= 4) return true

      return 'Vul minimaal 4 cijfers in.'
    },
  ],
  isAuthenticated: false,
})

const PINOK = computed(() => {
  return !isNaN(state.PIN) && state.PIN.length >= 4
})

function setSelectedAlias(selectedAlias) {
  if (selectedAlias === undefined) return
  state.aliasSelected = selectedAlias
  state.alert = state.assignedUserIds.includes(state.aliasSelected.toUpperCase())
}

function doSigninUser() {
  state.PINverifiedOk = false
  if (aliasOK && PINOK) {
    // get the user's PIN
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/` + state.aliasSelected.toUpperCase() + '/PIN')).then((snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val() === state.PIN) {
          // on success
          state.isAuthenticated = true
        }
      } else {
        console.log("No data available")
      }
    }).catch((error) => {
      console.error(error);
    })
  }
}

</script>