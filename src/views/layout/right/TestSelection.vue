<template>
  <div>
    <v-btn @click="onClick">
      Check
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import emailjs from 'emailjs-com';
import { useMainStore } from '@/stores';
import { usePlanStore } from '@/stores/plan';
const store = computed(() => useMainStore().section_label);
const plan = computed(() => usePlanStore().plan);

const onClick = () => {
  // console.log(store.value)
  let nSection = 0;

  store.value.forEach(s => {
    console.log(s.label)
    for (const z of plan.value.zones) {
      for (const r of z.rows) {
        const temp = r.seats.map(seat => {
          if (seat.section_label === s.label) {
            return `${r.row_number}${seat.seat_number}`;
          }
        })
        const tt = [...new Set(temp)];
        console.log(temp)
        nSection += (temp.length - tt.length);
      }
    }
  })
  console.log(nSection)
  return nSection;

  // emailjs.init({
  //   publicKey: "YG7BisNaYfrxXShP-"
  // })
  // var templateParams = {
  //   name: 'James',
  //   notes: 'Check this out!'
  // };

  // emailjs.send('service_x9wwqf2', 'your_template_id', templateParams)
  //   .then(function (response) {
  //     console.log('SUCCESS!', response.status, response.text);
  //   }, function (error) {
  //     console.log('FAILED...', error);
  //   });
}
</script>