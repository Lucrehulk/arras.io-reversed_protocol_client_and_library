// Very incomplete. Mainly just looked into utilizing this for facing mechanics. I did facing position does not extend outside 1 byte range (if it is far away from center it may extend to two bytes for x and y facing in the packet). 
// Can use in the form of x = cos(theta), y = sin(theta) polar type coords, but encoded in a manner so they range from 0-191
// Xleft of center (0) = values decreasing starting from 191, and for Xright of center it increases from 0.
// Same concept for Ys, upwards = decreasing from 191
// Direction is a code which tells the tank how it will move, literally just for movement but I didn't map them all out here, but like for example 1 = only up pretty sure.
function construct_control_packet(x_comp, y_comp, direction) {
  return new Uint8Array([67, x_comp, y_comp, direction]);
}
