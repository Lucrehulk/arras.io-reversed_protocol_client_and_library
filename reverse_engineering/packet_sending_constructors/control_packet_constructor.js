// Very incomplete. Mainly just looked into utilizing this for facing mechanics. I did facing position does not extend outside 1 byte range (if it is far away from center it may extend to two bytes for x and y facing in the packet). 
// Can use in the form of x = cos(theta), y = sin(theta) polar type coords, but encoded in a manner so they range from 0-191
// For one byte values, which is all I wanted since I wanted angles, X will go from 191-128 decreasing as you go left of center, and for right of center it goes 1-127 both are inclusive, 0 is center obv.
// Same concept applies to Ys but it goes 191-128 for upwards, and 1-127 downwards.
// Since ranges are uneven we can take the smaller range (191-128) and construct a facing angle for the 64 value range (so 191-128, 1-64).
// Direction is a code which tells the tank how it will move, literally just for movement but I didn't map them all out here, but like for example 1 = only up pretty sure.
function construct_control_packet(x_comp, y_comp, direction) {
  return new Uint8Array([67, x_comp, y_comp, direction]);
}

// Adding this. Method for calculating the angle based off of what was described earlier.
function yield_control_comps_from_angle(angle) {
    let cartesian_x_comp = Math.cos(angle);
    let cartesian_y_comp = Math.sin(angle);
    let x_comp = Math.abs(Math.floor(cartesian_x_comp * 64));
    let y_comp = Math.abs(Math.floor(cartesian_y_comp * 64));
    if (cartesian_x_comp < 0) x_comp = 191 - x_comp;
    if (cartesian_y_comp > 0) y_comp = 191 - y_comp;
    return [x_comp, y_comp];
};
