
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
 * 遍历给定的JSON，遍历过程可分为捕获与冒泡两个阶段：
 * 首先开始的是捕获阶段，这时程序会从JSON的根节点开始进行深度优先遍历，每当遍历至新节点时就会触发`onNodeCapturing`句柄函数，并将该节点标记为已被捕获；
 * 当捕获阶段的所有回调函数都执行结束后，冒泡阶段便开始了。冒泡事件只会在已被捕获的节点上触发，且仅当该节点的所有后代节点都已触发过`onNodeBubbling`句柄函数或者该节点没有后代节点时，该节点才会触发`onNodeBubbling`句柄函数。
 *
 * @export {Function}
 * @param {JSON} json
 * @param {Function} onNodeCapturing this callback has 7 arguments: {node, nodeType, nodeKey, parentNode, deepFind, path, depth, overleapChildren}
 * @param {Function} onNodeBubbling this callback has 6 arguments: {node, nodeType, nodeKey, parentNode, deepFind, path, depth}
 * @returns {JSON} json
 */
module.exports = async function travelJSON({
  json,
  onNodeBubbling,
  onNodeCapturing
}) {
  if (!json) {
    throw 'no json to traverse'
  }

  deepFind = deepFind.bind(this, json);
  let overleaped = new Set();

  let overleapChildren = function (node) {
    overleaped.add(node)
  }

  let bubblingQueue = [];

  let travel = async function (node, {parentNode, nodeKey, path, nodeType, depth} = {
    parentNode: null,
    nodeKey: null,
    path: "",
    nodeType:'root',
    depth: 0
  }) {
    // 计算 `path` 与 `nodeType` 的值。
    if (nodeKey) {
      path = path + "." + nodeKey;
      if (typeof node === "object") {
        nodeType = 'branch'
      } else {
        nodeType = 'leaf'
      }
    }

    await (onNodeCapturing && onNodeCapturing({ node, parentNode, nodeKey, path, deepFind, nodeType, overleapChildren, depth}));

    if (typeof node === "object") {
      if (!overleaped.has(node)) {
        for (const key in node) {
          let childNode = node[key];
          await travel(childNode, { parentNode: node, nodeKey: key, path: path + "." + key, depth: depth+1 });
        }
      }
    }

    if (onNodeBubbling) bubblingQueue.push({ node, parentNode, nodeKey, path, deepFind, nodeType, depth })
  };

  await travel(json);
  // nodes bubbling
  if (onNodeBubbling) {
    for (const e of bubblingQueue) {
      await onNodeBubbling(e)
    }
  }

  return json;
}

