<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { goto } from "$app/navigation";

  let { params = {}, data = {} } = $props();
</script>

<View class="flex-1 gap-6 p-4">
  <View class="gap-1">
    <Text class="text-2xl font-bold text-foreground">Dynamic Route: /tasks/[id]</Text>
    <Text class="text-sm text-muted-foreground">Loaded parameters and data via client load()</Text>
  </View>

  <View class="bg-card border border-border rounded-2xl p-6 gap-4">
    <View class="gap-1">
      <Text class="text-xs uppercase font-bold text-muted-foreground">Task Identifier</Text>
      <Text class="text-2xl font-extrabold text-primary">{data.title || `Task #${params.id}`}</Text>
    </View>

    <View class="gap-1">
      <Text class="text-xs uppercase font-bold text-muted-foreground">Summary</Text>
      <Text class="text-base text-foreground">{data.summary || "Loading task details..."}</Text>
    </View>

    <View class="flex-row items-center justify-between pt-2 border-t border-border">
      <Text class="text-sm text-muted-foreground">Status</Text>
      <Text class="text-sm font-bold {data.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}">
        {data.status || "Pending"}
      </Text>
    </View>
  </View>

  <View class="flex-row gap-3">
    <Button
      onPress={() => goto(`/tasks/${Number(params.id || 1) + 1}`)}
      class="bg-primary px-5 py-2.5 rounded-xl active:opacity-75"
    >
      <Text class="text-primary-foreground font-semibold">Next Task →</Text>
    </Button>
    <Button
      onPress={() => goto("/")}
      class="border border-input bg-background px-5 py-2.5 rounded-xl active:bg-muted"
    >
      <Text class="text-foreground font-semibold">Home</Text>
    </Button>
  </View>
</View>
