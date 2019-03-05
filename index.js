/**
 * 创建一个给定的json的深拷贝，然后遍历它，遍历会从某个叶节点开始，优先遍历其兄弟节点，然后逐级向上遍历父节点，直到遍历至根节点前结束。每当在遍历中发现新节点时，给定的回调函数就会被调用；当遍历结束时，还会触发给定的结束事件的句柄函数。
 *
 * @export {Function}
 * @param {JSON} json
 * @param {Function} onMeetNode this callback has 5 arguments: {element, parentObject, path, json, propName}
 * @param {Function} onFinish this callback will be excuted at the deadline of traversal. and it has 1 argument: [json]
 * @returns {JSON}
 */
export default async function travelJSON ({json, onMeetNode, onFinish}) {
  json = JSON.parse(JSON.stringify(json)) // deep copy json
  let travel = async function (element, parentObject, propName, path = '') {
    if (parentObject) path = path+'.'+propName;
    if (element.__proto__.constuctor === Object) {
      for (const key in element) {
        let e = element[key];
        await travel(e, parentObject, key, path+'.'+key)
      }
    }
    else if (element.__proto__.constuctor === Array) {
      for (let key = 0; key < element.length; key++) {
        let e = element[key];
        await travel(e, parentObject, key, path+'.'+key)
      }
    }
    if (element !== json) await onMeetNode({element, parentObject, propName, json, path})
  }
  await travel(json)
  if (onFinish) await onFinish(json)
  return json
}