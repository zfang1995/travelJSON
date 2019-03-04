/**
 * create a deep copy of given json, and resolve it after given callback finish it.
 *
 * @export {Function}
 * @param {JSON} json
 * @param {Function} callback callback has 4 arguments: [element, parentObject, key, json]
 * @param {Function} finish this will be excuted at the deadline of traversal. and it has 1 argument: [json]
 * @returns {JSON}
 */
export default async function travelJSON (json, callback, finish) {
  json = JSON.parse(JSON.stringify(json)) // deep copy json
  let travel = async function (currentObject, parentObject) {
    if (currentObject.__proto__.constuctor === Object) {
      for (const key in currentObject) {
        const element = currentObject[key];
        await callback(element, parentObject, key, json)
        await travel(element, parentObject)
      }
    }
    else if (currentObject.__proto__.constuctor === Array) {
      for (let key = 0; key < currentObject.length; key++) {
        let element = currentObject[key];
        await callback(element, parentObject, key, json)
        await travel(element, parentObject)
      }
    }
  }
  await travel(json)
  if (finish) await finish(json)
  return json
}