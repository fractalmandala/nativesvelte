<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import Badge from "./components/Badge.svelte";
  import Button from "./components/Button.svelte";
  import Card from "./components/Card.svelte";
  import Segmented from "./components/Segmented.svelte";
  import Switch from "./components/Switch.svelte";
  import TextInput from "./components/TextInput.svelte";

  let clickCount = $state(0);
  let userName = $state("");
  let notificationsEnabled = $state(true);
  let timeRange = $state("weekly");
  let actionLog = $state<string[]>([]);

  function log(msg: string) {
    actionLog = [msg, ...actionLog].slice(0, 8);
  }

  const rangeOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  let badgeVariant = $derived(
    clickCount > 5 ? "destructive" : clickCount > 2 ? "success" : "default"
  );
</script>

<View class="flex-1 bg-background p-6">
  <View class="gap-6 max-w-2xl self-center w-full">
    <!-- Header -->
    <View class="flex-row items-center justify-between border-b border-border pb-4">
      <View class="gap-1">
        <Text class="text-2xl font-bold text-foreground">NativeSvelte Components</Text>
        <Text class="text-sm text-muted-foreground">
          Reusable UI built with Svelte 5 runes and native layout
        </Text>
      </View>
      <Badge label={notificationsEnabled ? "Active" : "Paused"} variant={notificationsEnabled ? "success" : "secondary"} />
    </View>

    <!-- Buttons Section -->
    <Card title="Buttons & Counters" description="Native button variants with Svelte 5 reactivity">
      <View class="gap-4">
        <View class="flex-row items-center gap-3 flex-wrap">
          <Button
            testID="primary-counter-btn"
            variant="primary"
            onPress={() => {
              clickCount++;
              log(`Primary pressed (${clickCount})`);
            }}
          >
            <Text class="text-primary-foreground font-medium">Click Count: {clickCount}</Text>
          </Button>

          <Button
            variant="secondary"
            onPress={() => {
              clickCount = 0;
              log("Counter reset");
            }}
          >
            <Text class="text-secondary-foreground font-medium">Reset</Text>
          </Button>

          <Button
            variant="outline"
            onPress={() => log("Outline pressed")}
          >
            <Text class="text-foreground font-medium">Outline</Text>
          </Button>

          <Button
            variant="destructive"
            onPress={() => log("Destructive pressed")}
          >
            <Text class="text-white font-medium">Delete</Text>
          </Button>

          <Button
            variant="ghost"
            onPress={() => log("Ghost pressed")}
          >
            <Text class="text-foreground font-medium">Ghost</Text>
          </Button>
        </View>

        <View class="flex-row items-center gap-2">
          <Text class="text-sm text-muted-foreground">Threshold Badge:</Text>
          <Badge label={`Level ${clickCount}`} variant={badgeVariant} />
        </View>
      </View>
    </Card>

    <!-- Form & Inputs Section -->
    <Card title="Inputs & Data Binding" description="Two-way bindings with native text inputs">
      <View class="gap-4">
        <TextInput
          label="Your Name"
          testID="name-input"
          placeholder="Enter your name..."
          value={userName}
          onChange={(val) => {
            userName = val;
            log(`Typed: ${val}`);
          }}
        />

        {#if userName.trim()}
          <View class="rounded-lg bg-muted p-3">
            <Text class="text-sm font-medium text-foreground">
              Hello, {userName}! Welcome to NativeSvelte.
            </Text>
          </View>
        {/if}
      </View>
    </Card>

    <!-- Controls Section -->
    <Card title="Toggles & Segmented Controls" description="Interactive switches and options">
      <View class="gap-5">
        <View class="flex-row items-center justify-between">
          <View class="gap-0.5">
            <Text class="text-sm font-medium text-foreground">Push Notifications</Text>
            <Text class="text-xs text-muted-foreground">Receive real-time alerts</Text>
          </View>
          <Switch
            testID="notifications-switch"
            checked={notificationsEnabled}
            onChange={(checked) => {
              notificationsEnabled = checked;
              log(`Notifications: ${checked ? "Enabled" : "Disabled"}`);
            }}
          />
        </View>

        <View class="gap-2">
          <Text class="text-sm font-medium text-foreground">Report Interval: {timeRange}</Text>
          <Segmented
            options={rangeOptions}
            value={timeRange}
            onChange={(val) => {
              timeRange = val;
              log(`Interval selected: ${val}`);
            }}
          />
        </View>
      </View>
    </Card>

    <!-- Activity Log -->
    {#if actionLog.length > 0}
      <Card title="Recent Activity" description="Live audit log of component events">
        <View class="gap-2">
          {#each actionLog as entry}
            <View class="flex-row items-center gap-2 py-1 border-b border-border">
              <Text class="text-xs text-primary font-mono">•</Text>
              <Text class="text-xs text-foreground font-mono">{entry}</Text>
            </View>
          {/each}
        </View>
      </Card>
    {/if}
  </View>
</View>
