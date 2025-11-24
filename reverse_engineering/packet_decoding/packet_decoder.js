let rotator_table = [1, 2, 3, 3, 3, 3, 3, 3, 4, 3];

function i64_as_f32(var2) {
    const result = Number(var2);
    return Math.fround(result);
};

function i64_extend_i32_u(var2) {
    return BigInt(var2 >>> 0);
};

function decode_packet(packet, header = undefined) {
    let packet_read_index = 0;
    let remaining_packet_len = packet.length;
    let decoded_packet = [];
    let offsets = [];

    if (header) {
        packet_read_index = 1;
        remaining_packet_len = packet.length - 1;
        decoded_packet = [header];
        offsets = [0];
    };

    while (remaining_packet_len > 0) {
        let var1, var2, var3, var4, var5, var6, var7, var8;

        var8 = remaining_packet_len;
        var5 = var8 - 1;
        remaining_packet_len = var5;
        offsets.push(packet_read_index);
        var3 = packet_read_index;
        var6 = packet_read_index + 1;
        packet_read_index = var6;

        var2 = packet[var3];
        var7 = (var2 ^ 255);
        var7 = Math.clz32(var7);
        var7 = var7 - 24;
        var7 = var7 & 255;

        switch (rotator_table[var7]) {
            case 1:
                decoded_packet.push(i64_as_f32(BigInt(var2)));
                break;
            case 2:
                var2 |= -64;
                decoded_packet.push(i64_as_f32(BigInt(var2) | -4294967296n));
                break;
            case 3:
                var3 = var7 - 2;
                remaining_packet_len = var5 - var3;
                var8 = var3 + var6;
                packet_read_index = var8;
                var1 = var7 + 25;
                var5 = (var2 << var1) >> var1;
                var2 = var5;
                block7: {
                    if (var3 == 0) break block7;
                    var4 = var3 & 7;
                    if (var4) {
                        var1 = var6;
                        var2 = var5;
                        while (var4) {
                            var2 = (var2 << 8) | packet[var1];
                            var6 = var1 + 1;
                            var1 = var6;
                            var4 = var4 - 1;
                        }
                    }
                }
                if (var5 < 0) {
                    decoded_packet.push(i64_as_f32(i64_extend_i32_u(var2) | -4294967296n));
                } else {
                    decoded_packet.push(i64_as_f32(i64_extend_i32_u(var2)));
                }
                break;
            case 4:
                decoded_packet.push(new Float32Array(packet.slice(packet_read_index, packet_read_index + 4).buffer)[0]);
                packet_read_index += 4;
                remaining_packet_len -= 4;
                break;
        }
    }
    return [decoded_packet, offsets];
};