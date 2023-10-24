<script>
    import { fade } from "svelte/transition";
    // import * as d3 from "d3";
    import {
        saveToLocalStorage,
        getFromLocalStorage,
        getMultipleKeysFromLocalStorage,
    } from "../support/useLocalStorage";
    import { afterUpdate, onMount } from "svelte";
    // Import the useChat function from the 'ai/svelte' module
    import { useCompletion } from "ai/svelte";
    import { completionStore } from "../support/store"; // Modify the path as per your file structure
    // import { isOutline } from "../support/store.js";
    // import { outline } from "../support/store.js";
    // import { nodeDataDblClicked } from "../support/store.js";
    import { openAIIsLoading } from "../support/store.js";
    import { completedOutline } from "../support/store.js";
    import { newNodeData } from "../support/store.js";
    // import { isGraph } from "../support/store.js";
    // import { isDeleteNode } from "../support/store.js";
    // import { toast } from "@zerodevx/svelte-toast";
    import { isNodeUpdate } from "../support/store.js";
    import { currentJsonToSave } from "../support/store.js";
    import { isLoadNewGraph } from "../support/store.js";
    import { ascii_bubble_graph } from "../support/store.js";
    import Switch from "./toggle.svelte";

    import Spinner from "./spinner.svelte";

    let endpoint = "/api/ascii_graph";
    let isNewConcept = false;

    // let selectedNode = $nodeDataDblClicked
    // let newNodeFromeUser = "";
    let currentJson = `
            Technical Skills
             ________|_________
            |        |         |
         Problem   Code     System
          Solving Skills      Design
            |         |       |
         Algorithms  Debugging |
                       |      |
                  Critical Thinking
                       |
                ______________
               |              |
          Collaboration   Continuous
            & Teamwork    Learning
               |              |
              Communication  Testing
`;
    onMount(() => {
        currentJson = getFromLocalStorage("ascii_graph_ai_current") || currentJson;
        console.log("currentJson", currentJson)
        // console.log("getFromLocalStorage", getFromLocalStorage("ascii_graph_ai_current"))
        // console.log("getMultipleKeysFromLocalStorage", getMultipleKeysFromLocalStorage("ascii_graph_ai_current"))
        ascii_bubble_graph.set(currentJson)
        function typeWriter() {
            if (i < asciiArt.length) {
                document.getElementById("ascii-art").innerHTML +=
                    asciiArt.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }

        // Call the function
        typeWriter();
    });

    let toggleValue = "off"; // Or whatever your default is

    // let jsonStart = 0;

    // let jsonEnd = null;
    // let nodeToReplace = "";
    // let nodeToExpand = ''

    let concept = "";
    // let outline = ''

    function handleToggleChange(event) {
        // event.detail contains the data emitted from the child component
        toggleValue = event.detail.value;
        console.log("multivalue", multiValue);
        console.log("event", toggleValue);
    }


    // Destructure the properties from the useChat function's return value
    const { complete, completion, isLoading, stop } = useCompletion({
        api: endpoint, // "/api/bubble_graph",
        onFinish: (_prompt, completion) => {
           
            saveToLocalStorage("ascii_graph_ai_current", completion);
        },
        onError: (err) => {
            //   toast.error(err.message);
            openAIIsLoading.set(false); // Move this outside the if-else block
            console.log(err);
            isNewConcept = false;

            //   }
        },
    });

    function handleConcept() {
        // console.log("I am building new concept!!!!", concept);
        // jsonStartInit = 0;

        ascii_bubble_graph.set("");

        // endpoint = "/api/bubble_graph";
        isNewConcept = true;
        // isOutline.set(false);
        // newNodeData.set("");

        // nodeDataDblClicked.set('')
        if (multiValue === "flow") {
            complete("flow_graph_320_" + concept);
        } else {
            complete(concept);
        }
        // var count = 0;
        // completionStore.set(true);

        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            console.log("value", value);
            ascii_bubble_graph.update((previousValue) => {
                // console.log("ascii_bubble_graph", $ascii_bubble_graph)
                // Assuming previousValue is an array and you want to append the new value to it
                return value; //previousValue + value;
            });
        });

        concept = "";
    }

    $: {
        if ($isLoadNewGraph) {
            // isGraph.set(true) // remove current graph
            completionStore.set(true);

            console.log("NEW GRAPH", $currentJsonToSave);
            newNodeData.set($currentJsonToSave);
        } // set loaded graph
        currentJson = $currentJsonToSave;
        // isGraph.set(false) // remove current graph
    }

    isLoadNewGraph.set(false);

    let asciiArt = `
         _____     __________________  .___ .___    ________                        .__         _____   .___ 
        /  _  \\   /   _____/\\_   ___ \\ |   ||   |  /  _____/_______ _____   ______  |  |__     /  _  \\  |   |
       /  /_\\  \\  \\_____  \\ /    \\  \\/ |   ||   | /   \\  ___\\_  __ \\\\__  \\  \\____ \\ |  |  \\   /  /_\\  \\ |   |
      /    |    \\ /        \\\\     \\____|   ||   | \\    \\_\\  \\|  | \\/ / __ \\_|  |_> >|   Y  \\ /    |    \\|   |
      \\____|__  //_______  / \\______  /|___||___|  \\______  /|__|   (____  /|   __/ |___|  / \\____|__  /|___|
              \\/         \\/         \\/                    \\/             \\/ |__|         \\/          \\/      `;

    let i = 0;
    let speed = 1; // Speed of the effect in milliseconds

    let multiValue = "nerd";

    afterUpdate(() => {
        currentJsonToSave.set(currentJson);
        saveToLocalStorage("ascii_graph_ai_current", currentJson);
    });

    $: {
        console.log(multiValue);
    }
</script>

<div class="form-container" transition:fade={{ duration: 300 }}>
    <pre id="ascii-art" />
    {#if $isLoading}
        <Spinner />
    {/if}
    <div class="flex-container">
        <!-- <div class="flex-start"> -->
        <div class="input-group">
            <input
                class="input_ai"
                bind:value={concept}
                placeholder="Enter the concept or an idea you want to visualize"
            />
            <button on:click={handleConcept} class="submit-btn">Submit</button>
        </div>
        <Switch
            bind:value={multiValue}
            on:change={handleToggleChange}
            label="Choose a graph"
            design="multi"
            options={["flow", "bubble"]}
            fontSize={12}
        />

        <!-- </div> -->
    </div>
</div>

<style>
    .form-container {
        width: 100%;
        max-width: 800px;
        height: fit-content;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #e5e5e5;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .input_ai {
        max-width: 300px;
        margin-left: 40px;
    }
    .nodeSelected {
        /* background-color: lightcoral; */
    }

    .flex-container {
        display: flex;
        justify-content: space-between;
    }

    .flex-start {
        flex: 1; /* Takes available space */
    }

    .flex-end {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .input-group {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        max-width: fit-content;
    }

    .input-group-del-exp-buttons {
        display: flex;
        align-items: start;
        margin-bottom: 20px;
    }

    .input-group-stack {
        display: flex;
        flex-direction: column; /* Stack vertically */
        align-items: flex-start; /* Align items to the start */
    }

    /* Rest of your CSS styles */

    .input-group:not(:last-child) {
        margin-right: 20px;
    }

    input {
        display: block;
        width: calc(100% - 100px);
        padding: 10px;
        border: 1px solid #e5e5e5;
        border-radius: 5px;
    }

    .outline-btn,
    .download-btn,
    .submit-btn,
    .submit-btn-del-exp {
        background-color: #e0e0e0; /* light gray */
        color: #000; /* black text */
        padding: 10px 15px;
        border: none;
        /* border: solid 1px black; */
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .outline-btn:hover,
    .download-btn:hover,
    .submit-btn:hover,
    .submit-btn-del-exp:hover {
        background-color: #b0b0b0; /* darker gray on hover */
    }

    @media (max-width: 600px) {
        .flex-container {
            flex-direction: column;
        }

        .input-group:not(:last-child) {
            margin-right: 0;
        }
    }
</style>
