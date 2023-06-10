<template>
	<div v-if="doChoosePin" class="text-left">
		<v-row>
			<v-col cols="12">
				<h1>Hallo {{ props.alias }}</h1>
				<h3>Kies pincode</h3>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="7">
				<v-text-field density="compact" v-model.trim="state.PIN" label="PIN" :rules="state.pinRules" />
			</v-col>
			<v-col cols="5">
				<v-btn color="black" size="large" :disabled="!PINOK" @click="doSignupUser">OK</v-btn>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12" class="text-left">
				<h4>De app onthoudt je alias en pincode</h4>
				<div class="py-6" />
				<p>De volgende vragen zijn optioneel:</p>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="8" class="text-left">
				<v-text-field density="compact" label="Geboorte Jaar" v-model.trim="state.gebJaar"
					:rules="state.gebJaarRules" />
			</v-col>
			<v-col cols="4">
				<v-btn density="compact" icon="mdi-open-in-new"></v-btn>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12">
				<v-btn-toggle v-model="state.gender" rounded="0" color="deep-purple-accent-3" group>
					<v-btn value="0">
						Man
					</v-btn>
					<v-btn value="1">
						Vrouw
					</v-btn>
					<v-btn value="2">
						Anders
					</v-btn>
					<v-btn value="3">
						Niet opgegeven
					</v-btn>
				</v-btn-toggle>
				<p> Wil je maandelijks via de app op de<br>
					hoogte gehouden worden van nieuws<br>
					over het speelmee.app platform?
				</p>
			</v-col>
		</v-row>


		<div class="py-14" />
		<v-row class="justify-end">
			<v-col cols="auto">
				<v-btn flat append-icon="mdi-arrow-right" @click="emit('exit-pin-choice')">
					Doorgaan
					<template v-slot:append>
						<v-icon size="x-large" color="purple"></v-icon>
					</template>
				</v-btn>
			</v-col>
		</v-row>
		<div class="py-14" />
	</div>
</template>

<script setup>
import { reactive, computed } from 'vue'
const props = defineProps(['doChoosePin', 'alias'])
const emit = defineEmits(['exit-pin-choice'])

const state = reactive({
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
		}
	],
	overlay: true,
	gebJaar: 2002,
	gender: 0,
	gebJaarRules: [
		value => {
			if (value) return true

			return 'Vul 4 cijfers in.'
		},
		value => {
			if (!isNaN(value)) return true

			return 'Vul alleen cijfers in.'
		},
		value => {
			if (value.length === 4) return true

			return 'Vul 4 cijfers in.'
		}
	],
})

const PINOK = computed(() => {
	return !isNaN(state.PIN) && state.PIN.length >= 4
})

function doSignupUser() {
	return
	state.newUserDialog = false

	if (aliasOK && PINOK) {
		const db = getDatabase();
		set(ref(db, 'users/' + state.aliasSelected.toUpperCase()), {
			PIN: state.PIN,
			alias: state.aliasSelected,
			subscriptionDate: Date.now()
		})
		// add new alias to current array
		state.assignedUserIds.push(state.aliasSelected.toUpperCase())

		// on success
		state.PINverifiedOk = true
	}
}
</script>