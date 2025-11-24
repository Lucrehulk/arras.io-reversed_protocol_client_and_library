class room_parser {
    constructor() {
        this.room_dimensions = [];
        this.grid = [];
    }

    parse(packet, game_data) {
        let split_game_data = game_data.split(",");
        for (let entry in split_game_data) {
            let current_data = split_game_data[entry].split("=");
            this[current_data[0]] = current_data[1];
        };
        this.room_dimensions = [packet[0], packet[1], packet[2], packet[3]];
        // Unsure of what either of these values are, usually just 1 and 45
        let idk_1 = packet[4];
        let idk_2 = packet[5];
        let grid_width = packet[6];
        let grid_height = packet[7];
        this.grid = Array.from({ length: grid_height }, () => Array.from({ length: grid_width }, () => 0));
        let grid_data = packet.slice(8, packet.length);
        let iter = 0;
        for (let y = 0; y < grid_height; y++) {
            for (let x = 0; x < grid_width; x++) {
                this.grid[y][x] = grid_data[iter];
                iter++;
            }
        }
    }
}