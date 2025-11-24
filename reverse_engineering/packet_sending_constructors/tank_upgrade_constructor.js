function construct_upgrade_packet(upgrade) {
    return new Uint8Array([85, upgrade]);
}