<script>
  import { List, Text, View } from "nsh";
  import { Button, Input, NavPage } from "nsh/base";
  import Header from "../components/Header.svelte";
  import { nav } from "../nav";
  import { addTask, allTasks } from "../store";

  let draft = $state("");

  function submit() {
    addTask(draft);
    draft = "";
  }
</script>

<NavPage title="Tasks" header={<Header title="Tasks" />}>
  <View class="flex-1 gap-3 p-4 pb-[env(safe-area-inset-bottom)]">
    <View class="flex-row items-center gap-2">
      <Input
        bind:value={draft}
        onSubmit={submit}
        placeholder="New task"
        class="flex-1 rounded-(--radius) border border-input px-3 py-2 text-foreground"
      />
      <Button
        disabled={!draft.trim()}
        onPress={submit}
        class="rounded-(--radius) bg-primary px-4 py-2 active:opacity-60 disabled:opacity-40"
      >
        <Text class="text-primary-foreground">Add</Text>
      </Button>
    </View>

    <List each={allTasks()} keyExtractor={(task) => String(task.id)} estimatedItemSize={48} class="flex-1">
      {(task) => (
        <Button
          onPress={() => nav.push({ name: "task", id: task().id })}
          class="flex-row items-center justify-between p-3 active:bg-muted"
        >
          <Text class="text-foreground">{task().title}</Text>
          <Text class="text-muted-foreground">{task().done ? "Done" : "Open"}</Text>
        </Button>
      )}
    </List>
  </View>
</NavPage>
