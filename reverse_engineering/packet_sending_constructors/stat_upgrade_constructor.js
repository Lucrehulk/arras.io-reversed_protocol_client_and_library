function construct_stat_upgrade_packet(stat, len) {
    return new Uint8Array([120, stat, len]);
}
