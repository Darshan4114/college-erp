var make_arr = new Array("Maruti Suzuki", "Tata", "Honda");

var model_arr = new Array();
model_arr[0] = "";
model_arr[1] = "Swift | Swift Dzire | Eeco | Brezza | Celerio";
model_arr[2] = "Tiago | Tigor | Nexon";
model_arr[3] = "City | Amaze | Jazz";

export function getMakeList() {
  return make_arr;
}
export function getModelList(province) {
  const makeIdx = make_arr.indexOf(province);
  return model_arr[makeIdx + 1].trim().split(" | ");
}
