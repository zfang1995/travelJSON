let travel = async function({
  node,
  // eslint-disable-next-line no-undef
  parentNode = json,
  nodeKey,
  path = ""
}) {
  if (nodeKey) path = path + "." + nodeKey;
  if (node && node.__proto__.constructor === Object) {
    for (const key in node) {
      let childNode = node[key];
      await travel(childNode, parentNode, key, path + "." + key);
    }
  } else if (node && node.__proto__.constructor === Array) {
    for (let key = 0; key < node.length; key++) {
      let childNode = node[key];
      await travel(childNode, parentNode, key, path + "." + key);
    }
  }
  // eslint-disable-next-line no-undef
  if (node !== json)
    // eslint-disable-next-line no-undef
    await onMeetNode({ node, parentNode, nodeKey, json, path, deepFind });
};

let deepFind = function(obj, path) {
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
 * 创建一个给定的json的深拷贝，然后遍历它，遍历会从某个叶节点开始，优先遍历完所有的叶节点，然后逐级向上遍历父节点，直到遍历至根节点前结束。每当在遍历至新节点时（不包括根节点），`onMeetNode` 句柄函数就会被调用；当遍历至根节点时，`onFinish`句柄函数会被调用。
 *
 * @export {Function}
 * @param {JSON} json
 * @param {Function} onMeetNode this callback has 5 arguments: {node, parentNode, path, json, nodeKey, deepFind}
 * @param {Function} onFinish this callback will be executed at the deadline of traversal. and it has 1 argument: [json]
 * @returns {JSON}
 */
// eslint-disable-next-line no-unused-vars
export default async function travelJSON({ json, onMeetNode, onFinish }) {
  json = JSON.parse(JSON.stringify(json)); // deep copy json
  deepFind = deepFind.bind(this, json);
  await travel(json);
  if (onFinish) await onFinish(json);
  return json;
}
