<script>
    import { onMount } from 'svelte';
    import { basicSetup, EditorView } from "codemirror";
    import { EditorState, Compartment } from "@codemirror/state";
    import { javascript } from '@codemirror/lang-javascript';
    import { ascii_bubble_graph } from "../support/store.js";
    // ascii_graph_ai_current
  
    let codeMirror;

    let copied = false;  // State for copy button icon

    
    function copyCode() {
        const copyText = codeMirror.state.doc.toString();
        navigator.clipboard.writeText(copyText).then(() => {
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 1000);  // Reset after 1 second
        }, (error) => {
            console.error('Copy failed:', error);
        });
    }
  
    console.log("$ascii_bubble_graph", $ascii_bubble_graph)

    onMount(() => {
        codeMirror = new EditorView({
            state: EditorState.create({
                doc: $ascii_bubble_graph,  // Set initial content to the value of ascii_bubble_graph
                extensions: [basicSetup, javascript(), EditorView.theme({
                    "&": {
                        backgroundColor: "black",
                        color: "#ffffff"
                    }
                }),
            ],
            }),
            parent: document.querySelector('.code-output'),
        });
    });

let isEditorVisible = false;


$: {
    isEditorVisible = !!$ascii_bubble_graph;
}

$: if (isEditorVisible && codeMirror) {
    codeMirror.focus();
}






$: {
    if (codeMirror && $ascii_bubble_graph) {
        // Replace the entire content
        codeMirror.dispatch({
            changes: [{ from: 0, to: codeMirror.state.doc.length, insert: $ascii_bubble_graph }],
        });
    }
}

</script>
<style>
    @import './styles/codemirror.css';
    @import './styles/solarized.css';
    div {
        border: none !important;
    }
    .node-view-ai {
        display: inline-block;
    }
    .node-view-ai-input {
        /* ... */
    }
    .node-view-ai-button, .node-view-ai-run-button {
        /* ... */
    }
    .code-output {
        position: relative;  /* Establish a positioning context */
        width: auto;
        height: auto;
        overflow: visible;  /* Ensure overflow is visible */
    }
    .copy-button {
        position: absolute;  /* Position the button absolutely */
        top: 0;  /* Align to the top */
        right: 50%;  /* Align to the right */
        cursor: pointer;
        color: white;
        font-size: 1rem;
        padding: 3px;
        border: 1px solid white;
        padding: 10px;  /* Optional: add some padding */
        background-color: transparent;  /* Optional: set a background color */
          /* Optional: remove border */
        z-index: 1000;  /* Ensure it's on top of other elements */
    }
    .copy-button.copied {
        color: white;  /* Set the color to green when copied */
    }
</style>
<div class="node-view-ai">
    <div class="code-output" class:visible={isEditorVisible} class:hidden={!isEditorVisible}>
        <!-- ... (other content remains unchanged) -->
        <span class="copy-button {copied ? 'copied' : ''}" on:click={copyCode}>
            {#if copied}
                copied!
            {:else}
                copy graph
            {/if}
        </span>
        <!-- ... (other content remains unchanged) -->
    </div>
</div>
<!-- {/if} -->
