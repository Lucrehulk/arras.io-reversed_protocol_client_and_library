function construct_upgrade_packet(stat) {
    return new Uint8Array([120, stat, 191]);
}