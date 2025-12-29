// 0 = autofire, 1 = autospin, 2 = override
function construct_command_packet(action) {
    return new Uint8Array([116, action]);
}
