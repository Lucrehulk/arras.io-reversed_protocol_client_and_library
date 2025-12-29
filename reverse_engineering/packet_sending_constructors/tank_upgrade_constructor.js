function construct_tank_upgrade_packet(upgrade) {
    return new Uint8Array([85, upgrade]);
}
