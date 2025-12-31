// 0 = autofire, 1 = autospin, 2 = override, 3 = reverse tank
function construct_command_packet(action) {
    return new Uint8Array([116, action]);
}
