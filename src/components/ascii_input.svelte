<script>
    import { fade } from "svelte/transition";
    import * as d3 from "d3";
    import {
        saveToLocalStorage,
        getFromLocalStorage,
        getMultipleKeysFromLocalStorage,
    } from "../support/useLocalStorage";
    import { afterUpdate, onMount } from "svelte";
    // Import the useChat function from the 'ai/svelte' module
    import { useCompletion } from "ai/svelte";
    import { completionStore } from "../support/store"; // Modify the path as per your file structure
    import { isOutline } from "../support/store.js";
    import { outline } from "../support/store.js";
    import { nodeDataDblClicked } from "../support/store.js";
    import { openAIIsLoading } from "../support/store.js";
    import { completedOutline } from "../support/store.js";
    import { newNodeData } from "../support/store.js";
    import { isGraph } from "../support/store.js";
    import { isDeleteNode } from "../support/store.js";
    import { toast } from "@zerodevx/svelte-toast";
    import { isNodeUpdate } from "../support/store.js";
    import { currentJsonToSave } from "../support/store.js";
    import { isLoadNewGraph } from "../support/store.js";
    import { ascii_bubble_graph } from "../support/store.js";
    import Switch from "./toggle.svelte";

    import Spinner from "./spinner.svelte";

    let endpoint = "/api/ascii_graph";
    let isNewConcept = false;

    // let selectedNode = $nodeDataDblClicked
    let newNodeFromeUser = "";
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
        currentJson = getFromLocalStorage("current_ai_graph");

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

    let processBuffer = "";
    let jsonStartInit = 0;
    // let jsonStart = 0;

    // let jsonEnd = null;
    const regex = /{[^}]*}/;
    let updatingANode = false;
    let nodeToReplace = "";
    // let nodeToExpand = ''

    let concept = "";
    let nodeToUpdate = false;
    // let outline = ''
    let unsanitizedGraph = ``;

    function handleToggleChange(event) {
        // event.detail contains the data emitted from the child component
        toggleValue = event.detail.value;
        console.log("multivalue", multiValue);
        console.log("event", toggleValue);
    }

    // The match() method searches a string for a match against a regular expression,
    // and returns an array of information or null on a mismatch.
    function handleCharacter(chunk) {
        if (chunk.length < 10) {
            jsonStartInit = 0;
        }
        processBuffer = chunk.substring(jsonStartInit);
        // console.log("processBuffer", jsonStartInit, processBuffer)
        const matches = processBuffer.match(regex);
        // console.log("matches", matches)
        if (matches && matches[0]) {
            jsonStartInit = chunk.lastIndexOf("}") + 1;
            const jsonNode = parseJSONString("[" + matches[0] + "]");
            if (jsonNode.length > 0) {
                return jsonNode;
            }
        }
    }

    function parseJSONString(inputString) {
        var jsonObject = [];
        const regex = /{[^}]*"source"[^}]*"target"[^}]*"value"[^}]*}/g;

        const matches = inputString.match(regex);
        // console.log("matches", matches)
        if (matches) {
            for (const match of matches) {
                try {
                    const parsedObject = JSON.parse(match);
                    jsonObject.push(parsedObject);
                } catch (error) {
                    console.error("Error parsing JSON object:", error);
                }
            }
        }

        return jsonObject;
    }

    // Destructure the properties from the useChat function's return value
    const { complete, completion, isLoading, stop } = useCompletion({
        api: endpoint, // "/api/bubble_graph",
        onFinish: (_prompt, completion) => {
            openAIIsLoading.set(false);
            // console.log("WOOGLE openAIIsLoading", $openAIIsLoading);
            if (isNewConcept) {
                unsanitizedGraph = completion;

                let sanitizedString = parseJSONString(completion);
                currentJson = sanitizedString;

                isNewConcept = false;
            } else if (nodeToUpdate) {
                try {
                    const newUnsanitizedGraph = completion;
                    let sanitizedString = parseJSONString(newUnsanitizedGraph);
                    // newNodeData.set(sanitizedString);
                    currentJson = sanitizedString;
                    saveToLocalStorage("current_ai_graph", sanitizedString);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;
                updatingANode = false;
                nodeToUpdate = false;
                newNodeData.set("");
            } else if ($isNodeUpdate) {
                try {
                    const newUnsanitizedGraph = completion;
                    let sanitizedString = parseJSONString(newUnsanitizedGraph);
                    // newNodeData.set(sanitizedString);
                    saveToLocalStorage("current_ai_graph", sanitizedString);

                    currentJson = sanitizedString;
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;
                nodeToUpdate = false;
                newNodeData.set("");
                isNodeUpdate.set(false);
            } else {
                completedOutline.set(completion); // make outline
            }

            // if(isNewConcept || nodeToUpdate)
            count = 0;
            jsonStartInit = 0;
            isNewConcept = false;
            nodeToUpdate = false;
            updatingANode = false;
            // currentJson = completion

            console.log(
                "isNewConcept, nodeToUpdate",
                isNewConcept,
                nodeToUpdate,
                updatingANode
            );
            let sanitizedString = parseJSONString(completion);
            saveToLocalStorage("current_ai_graph", sanitizedString);
        },
        onError: (err) => {
            //   toast.error(err.message);
            openAIIsLoading.set(false); // Move this outside the if-else block
            console.log(err);
            isNewConcept = false;

            //   }
        },
    });
    // console.log("isLoading", $isLoading)

    function handleConcept() {
        console.log("I am building new concept!!!!", concept);
        // jsonStartInit = 0;

        ascii_bubble_graph.set("");

        // endpoint = "/api/bubble_graph";
        isNewConcept = true;
        // isOutline.set(false);
        // newNodeData.set("");

        // nodeDataDblClicked.set('')
        if(multiValue === "flow"){
            complete("flow_graph_320_"+concept)
        }
        else {  complete(concept); }
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

    async function handleGraphUpdate() {
        jsonStartInit = 0;

        // nodeToUpdate = true;
        nodeToUpdate = true;

        complete(newNodeFromeUser);
        console.log("newNodeFromeUser", $nodeDataDblClicked);
        var count = 0;
        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            let result = handleCharacter(value);

            if (count === 0) {
                // currently turned off. make === 0 to turn on
                // completionStore.set(currentJson);
                isGraph.set(true);
                newNodeData.set(currentJson);
                count++;
            }
            if (result) {
                console.log("res", result);
                isGraph.set(false);
                newNodeData.set(result);
                count++;
                // saveToLocalStorage("current_ai_graph", currentJson);
            }
        });
    }

    async function handleExpandNode() {
        jsonStartInit = 0;

        // nodeToUpdate = true;
        nodeToUpdate = true;

        complete($nodeDataDblClicked);
        console.log("newNodeFromeUser", $nodeDataDblClicked);
        var count = 0;
        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            let result = handleCharacter(value);

            if (count === 0) {
                // currently turned off. make === 0 to turn on
                // completionStore.set(currentJson);
                isGraph.set(true);
                newNodeData.set(currentJson);
                count++;
            } else if (result) {
                // console.log("res", result);
                isGraph.set(false);
                if (count === 1 && result[0].source !== $nodeDataDblClicked) {
                    result.push({
                        source: $nodeDataDblClicked,
                        target: result[0].source,
                    });
                }
                newNodeData.set(result);
                count++;
                // saveToLocalStorage("current_ai_graph", currentJson);
            }
        });
    }

    async function handleNodeUpdate() {
        // jsonStartInit = 0;

        isNodeUpdate.set(true);
        complete($nodeDataDblClicked);
    }

    function deleteNodeInJson(nodeName, jsonObject) {
        // Filter the jsonObject to only include items that don't match the specified nodeName
        return jsonObject.filter(function (item) {
            return item.source !== nodeName && item.target !== nodeName;
        });
    }

    function handleDeleteNode() {
        currentJson = deleteNodeInJson($nodeDataDblClicked, currentJson);
        console.log("deleted!");
        isDeleteNode.set(true);
        toast.push("Success!", {
            theme: {
                "--toastColor": "mintcream",
                "--toastBackground": "rgba(72,187,120,0.9)",
                "--toastBarBackground": "#2F855A",
            },
        });
    }

    async function handleOutline() {
        // endpoint= "/api/outline"

        isOutline.set(true);

        if (unsanitizedGraph) {
            openAIIsLoading.set(true);
            // console.log("UNSANITIZED GRAPH", unsanitizedGraph, endpoint);
            complete("make_outline_320_" + unsanitizedGraph); // make_outline_320_ will tell the api to do outline
            completion.subscribe((value) => {
                outline.set(value); // Update the outline store with the new value
            });
            // isLoading.subscribe((value) => {
            //     openAIIsLoading.set(value);
            concept = "";
        }
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
        saveToLocalStorage("current_ai_graph", currentJson);
    });

    $:{
        console.log(multiValue)
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
                placeholder="Enter the concept of an idea you want to visualize"
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
