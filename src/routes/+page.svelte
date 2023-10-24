<script>
  import Layout from "../components/layout.svelte"
  // import InputAiCall from "../components/input_ai_call.svelte";
  // import BubbleGraph from "../components/bubble_graph.svelte";
  import Markdown_editor_svelte from "../components/Markdown_editor.svelte";
  import AsciiGraph from "../components/code_editor.svelte";
  import AsciiGraphInput from "../components/ascii_input.svelte";


  import { isOutline } from "../support/store.js";
  import { fade } from 'svelte/transition';
  import Resizeable from "../components/resizeable.svelte";  // It seems you imported this twice (with different casings), ensure to remove the unnecessary import

</script>

<style>
  .dual-layout {
    display: flex;
    justify-content: space-between;
  }


  /* Media Query for medium screens or smaller */
  @media (max-width: 768px) {
    .dual-layout {
      flex-direction: column;
    }


  }
</style>

<Layout>
  <!-- <InputAiCall /> -->
  <AsciiGraphInput />
  
  <div class={$isOutline ? "dual-layout" : "single-layout"} transition:fade>
    <!-- <BubbleGraph /> -->
<AsciiGraph />
    <!-- {#if $isOutline}
    <Resizeable>
      <Markdown_editor_svelte />
      </Resizeable>
    {/if} -->
  </div>
</Layout>
