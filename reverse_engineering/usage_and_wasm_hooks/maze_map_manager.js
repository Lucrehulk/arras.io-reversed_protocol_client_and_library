class maze_map_manager {
    constructor() {
        this.map = undefined;
        this.room_width = 0;
        this.room_height = 0;
        this.node_half_width = 0;
        this.node_half_height = 0;
        this.map_width = 0;
        this.map_height = 0;
        this.encoding_shift = 0;
        this.pathfinding_dirs = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ];
    }

    check_if_map_is_maze(global_minimap) {
        for (let id in global_minimap) if (global_minimap[id].type == 2) return true;
        return false;
    }

    parse_maze_map(room, global_minimap) {
        let sizes = {};
        for (let id in global_minimap) if (global_minimap[id].type == 2) if (!sizes[global_minimap[id].size]) sizes[global_minimap[id].size] = true;
        let sizes_values = Object.keys(sizes);
        let first_size = sizes_values[0];
        for (let iter = 1; iter < sizes_values.length; iter++) if (sizes_values[iter] < first_size) sizes_values[iter] = first_size;
        this.room_width = room.room_dimensions[2] - room.room_dimensions[0];
        this.room_height = room.room_dimensions[3] - room.room_dimensions[1];
        this.map_width = Math.trunc(this.room_width / first_size * 0.5);
        this.map_height = Math.trunc(this.room_height / first_size * 0.5);
        this.encoding_shift = Math.ceil(Math.log2(this.map_height));
        this.node_half_width = (this.room_width / this.map_width) * 0.5;
        this.node_half_height = (this.room_height / this.map_height) * 0.5;
        this.map = Array.from({
            length: this.map_height
        }, () => Array.from({
            length: this.map_width
        }, () => 0));
        let dx = 255 / this.map_width;
        let dy = 255 / this.map_height;
        for (let id in global_minimap) {
            if (global_minimap[id].type == 2) {
                let size = Math.trunc(global_minimap[id].size / first_size);
                let x_pos = Math.round((global_minimap[id].x - dx * (size / 2)) / dx);
                let y_pos = Math.round((global_minimap[id].y - dy * (size / 2)) / dy);
                for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) this.map[y_pos + y][x_pos + x] = global_minimap[id].color;
            }
        }
        let room_grid_node_size = this.map_height / room.grid.length;
        for (let y = 0; y < room.grid.length; y++) {
            for (let x = 0; x < room.grid[0].length; x++) {
                if (room.grid[y][x] == 10 || room.grid[y][x] == 11 || room.grid[y][x] == 12 || room.grid[y][x] == 15) {
                    for (let height = 0; height < room_grid_node_size; height++) {
                        for (let width = 0; width < room_grid_node_size; width++) {
                            this.map[Math.trunc(y * room_grid_node_size) + height][Math.trunc(x * room_grid_node_size) + width] = room.grid[y][x];
                        }
                    }
                }
            }
        }
    }

    parse_map_coordinate(x, y) {
        let x_ratio = x / 255;
        let y_ratio = y / 255;
        if (x_ratio < 0) {
            x_ratio = 0;
        } else if (x_ratio > 1) x_ratio = 1;
        if (y_ratio < 0) {
            y_ratio = 0;
        } else if (y_ratio > 1) y_ratio = 1;
        return [Math.trunc(x_ratio * this.map_width), Math.trunc(y_ratio * this.map_height)];
    }

    parse_position_coordinate(x, y, room_dimensions) {
        let x_ratio = (x - room_dimensions[0]) / this.room_width;
        let y_ratio = (y - room_dimensions[1]) / this.room_height;
        if (x_ratio < 0) {
            x_ratio = 0;
        } else if (x_ratio > 1) x_ratio = 1;
        if (y_ratio < 0) {
            y_ratio = 0;
        } else if (y_ratio > 1) y_ratio = 1;
        return [Math.trunc(x_ratio * this.map_width), Math.trunc(y_ratio * this.map_height)];
    }

    find_path(i, f, color) {
        let [start_x, start_y] = i;
        let [end_x, end_y] = f;
        if (start_x == end_x && start_y == end_y) return [];
        let start_encoded = (start_y << this.encoding_shift) | start_x;
        let end_encoded = (end_y << this.encoding_shift) | end_x;
        let queue = [start_encoded];
        let visited = new Set([start_encoded]);
        let parent_map = new Map();
        let path_found = false;
        let x_mask = (1 << this.encoding_shift) - 1;
        while (queue.length > 0) {
            let current_encoded = queue.shift();
            if (current_encoded == end_encoded) {
                path_found = true;
                break;
            }
            let curr_x = current_encoded & x_mask;
            let curr_y = current_encoded >> this.encoding_shift;
            for (let [dx, dy] of this.pathfinding_dirs) {
                let next_x = curr_x + dx;
                let next_y = curr_y + dy;
                if (next_x >= 0 && next_x < this.map_width && next_y >= 0 && next_y < this.map_height) {
                    let next_encoded = (next_y << this.encoding_shift) | next_x;
                    if (!visited.has(next_encoded)) {
                        let tile_value = this.map[next_y][next_x];
                        if (tile_value == 0 || tile_value == 17 || tile_value == color || next_encoded == end_encoded) {
                            visited.add(next_encoded);
                            parent_map.set(next_encoded, current_encoded);
                            queue.push(next_encoded);
                        }
                    }
                }
            }
        }
        if (!path_found) return [];
        let final_path = [];
        let current_step = parent_map.get(end_encoded);
        while (current_step != undefined && current_step != start_encoded) {
            final_path.push([current_step & x_mask, current_step >> this.encoding_shift]);
            current_step = parent_map.get(current_step);
        }
        return final_path.reverse();
    }
}
