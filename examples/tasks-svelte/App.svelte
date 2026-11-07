<script>
  import { View } from "nsh";
  import { NavStack } from "nsh/base";
  import { nav } from "./nav";
  import TaskList from "./pages/TaskList.svelte";
  import TaskDetail from "./pages/TaskDetail.svelte";
</script>

<View class="flex-1 bg-background">
  <NavStack state={nav} class="flex-1">
    {(route) => {
      switch (route.name) {
        case "tasks":
          return <TaskList />;
        case "task":
          return <TaskDetail id={route.id} />;
      }
    }}
  </NavStack>
</View>
