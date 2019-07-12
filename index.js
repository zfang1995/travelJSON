let travel = async function ({
  node,
  parentNode = null,
  nodeKey = null,
  path = ""
}) {
  if (nodeKey) path = path + "." + nodeKey;
  if (node && node.__proto__.constructor === Object) {
    for (const key in node) {
      let childNode = node[key];
      await travel({node: childNode, parentNode: node, key, path: path + "." + key});
    }
  } else if (node && node.__proto__.constructor === Array) {
    for (let key = 0; key < node.length; key++) {
      let childNode = node[key];
      await travel({node: childNode, parentNode: node, key, path: path + "." + key});
    }
  }

  await (onMeetNode && onMeetNode({ node, parentNode, nodeKey, json, path, deepFind }));

  if (nodeKey === null) 
    await (onRootNode && onRootNode({ json, deepFind }));
  else if (typeof node !== "object")
    await (onLeafNode && onLeafNode({ node, parentNode, nodeKey, json, path, deepFind }));
  else
    await (onBranchNode && onBranchNode({ node, parentNode, nodeKey, json, path, deepFind }));
};

let deepFind = function (obj, path) {
  var paths = path.split("."),
    current = obj,
    i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
};

/**
 * 遍历给定的JSON，遍历会从某个叶节点开始，优先遍历完所有的叶节点，然后逐级向上遍历父节点，直到遍历至根节点前结束。每当在遍历至新节点时（不包括根节点），`onMeetNode` 句柄函数就会被调用；当遍历至根节点时，`onFinish`句柄函数会被调用。
 *
 * @export {Function}
 * @param {JSON} json
 * @param {Function} onMeetNode this callback has 5 arguments: {node, parentNode, path, json, nodeKey, deepFind}
 * @param {Function} onLeafNode
 * @param {Function} onBranchNode
 * @param {Function} onRootNode this callback will be executed at the deadline of traversal. and it has 1 argument: [json]
 * @returns {JSON}
 */
export default async function travelJSON({
  json,
  onMeetNode,
  onLeafNode,
  onBranchNode,
  onRootNode
}) {
  deepFind = deepFind.bind(this, json);
  await travel({ node: json });
  return json;
}
