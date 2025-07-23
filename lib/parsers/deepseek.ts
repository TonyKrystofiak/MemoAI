import type { Conversation } from '@/types/conversation';

/**
 * Extracts a DeepSeek share page into a structured Conversation.
 * @param html - Raw HTML content from the DeepSeek share page
 * @returns Promise resolving to a structured Conversation object
 */
export async function parseDeepSeek(html: string): Promise<Conversation> {
  var html = parseHTML(html).outerHTML
  console.log(html)
  return {
    model: 'DeepSeek',
    content: html,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}

function parseHTML(html: string): HTMLElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rootNode = doc.getElementById('root');
    var leaf_nodes: Array<HTMLElement> = [];
    findDOMLeaves(<HTMLElement> rootNode, leaf_nodes);
    console.log(leaf_nodes);
    filterDOMLeaves(leaf_nodes);
    for (let i = 0; i < leaf_nodes.length; i++){
        console.log(leaf_nodes[i]);
    }
    var output = formatHTML(leaf_nodes)
    console.log(output)

    return output;
}

function findDOMLeaves(parent_node: HTMLElement, leaf_nodes: Array<HTMLElement>) {
    const child_elements = parent_node.children
    let valid_children: Array<HTMLElement> = []
    for (let i = 0; i < child_elements.length; i++) {
      const child = child_elements[i];
      if (child instanceof HTMLElement) {
        if (child.tagName == 'DIV' && !child.hidden) {
            valid_children.push(child);
        }
      }
    }

    if (valid_children.length == 0) {
      leaf_nodes.push(parent_node);
    } else {
      for (let i = 0; i < valid_children.length; i++) {
        findDOMLeaves(valid_children[i], leaf_nodes);
      }
    }
  }

function filterDOMLeaves(leaf_nodes: Array<HTMLElement>) {
  const forbidden_classes = ['SVG', 'SPAN', 'IMG'];
  const deepseek_strings = ['AI-generated, for reference only', 'Today', 'My Profile']
  let has_forbidden = false

  for (let i = leaf_nodes.length - 1; i >= 0; i--) {
    if (leaf_nodes[i].querySelector('svg, span, img')) {
      leaf_nodes.splice(i, 1);
    }
    else if (leaf_nodes[i].innerHTML.replace(/\s+/g, "") == "") {
      leaf_nodes.splice(i, 1);
    }
    else if (deepseek_strings.indexOf(leaf_nodes[i].innerHTML) > -1) {
      leaf_nodes.splice(i, 1);
    }
  }
  leaf_nodes.splice(1,1) //manually remove duplicated title content
}

function formatHTML(leaf_nodes: Array<HTMLElement>): HTMLElement {
  var container = document.createElement('div');
  for (let i = 0; i < leaf_nodes.length; i++) {
    container.appendChild(leaf_nodes[i])
  }
  return container
}
