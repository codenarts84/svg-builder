<template>
  <v-navigation-drawer location="right"
    style="top: 51px; width: 300px; padding-bottom: 50px; bottom: 50px; margin-right: 100px">

    <v-card title="Chart Validation">
      <v-card-text>
        <v-chip v-if="validateCategory" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateCategory} element(s) without category.` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All elements contain category.' }}
        </v-chip>

        <v-chip v-if="validateSection" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSection} element(s) without section.` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All elements contain section.' }}
        </v-chip>

        <v-chip v-if="validateSeatId" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSeatId} duplicate element(s)` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'No duplicate elements' }}
        </v-chip>

        <v-chip v-if="validateTableLabel" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateTableLabel} table seat(s) without table label` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All table seats contain table label' }}
        </v-chip>

        <v-chip v-if="validateTableAbv" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateTableAbv} table seat(s) without table abbreviation` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All table seats contain table abbreviation' }}
        </v-chip>

        <v-chip v-if="validateCapacity" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateCapacity} GA sections without capacity` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All GA sections has capacity' }}
        </v-chip>

        <v-chip v-if="validateSectionLabel" class="ma-2" color="red" closable
          label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSectionLabel} GA section(s) without label` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All GA sections contain label' }}
        </v-chip>

        <v-chip v-if="validateSectionAbv" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSectionAbv} GA section(s) without abbreviation` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All GA sections contain abbreviation' }}
        </v-chip>

        <v-chip v-if="validateSeatLabel" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSeatLabel} seat(s) without label` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All seats contain label' }}
        </v-chip>

        <v-chip v-if="validateRowLabel" class="ma-2" color="red" closable label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateRowLabel} row(s) without label` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'All rows contain label' }}
        </v-chip>

        <v-chip v-if="validateSeatSection" class="ma-2" color="red" closable
          label>
          <v-icon icon="mdi-close" start></v-icon>
          {{ `${validateSeatSection} seat(s) duplicate section` }}
        </v-chip>
        <v-chip v-else class="ma-2" color="green" closable label>
          <v-icon icon="mdi-check" start></v-icon>
          {{ 'No seats duplicate section' }}
        </v-chip>


      </v-card-text>


      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
      </v-card-actions>
    </v-card>

  </v-navigation-drawer>
</template>

<script setup>
</script>