use wasm_bindgen::prelude::*;

fn get_idx(x: i32, y: i32, w: i32) -> usize {
    ((y * w + x) * 4) as usize
}

#[wasm_bindgen]
pub fn fill(data: &mut [u8], w: i32, h: i32, r: u8, g: u8, b: u8, x: i32, y: i32, threshold: u32) {
    // Basic bounds check for the starting coordinate
    if x < 0 || x >= w || y < 0 || y >= h {
        return;
    }

    let start_idx = get_idx(x, y, w);
    let mut tr = data[start_idx];
    let mut tg = data[start_idx + 1];
    let mut tb = data[start_idx + 2];
    let ta = data[start_idx + 3];

    if ta == 0 {
        tr = 255;
        tg = 255;
        tb = 255;
    }

    if tr == r && tg == g && tb == b {
        return;
    }

    let match_target = |cx: i32, cy: i32, pixels: &[u8]| {
        let idx = get_idx(cx, cy, w);

        let dr = pixels[idx] as i32 - tr as i32;
        let dg = pixels[idx + 1] as i32 - tg as i32;
        let db = pixels[idx + 2] as i32 - tb as i32;

        let distance_sq = dr * dr + dg * dg + db * db;

        distance_sq < threshold as i32
    };

    let set_pixel = |cx: i32, cy: i32, pixels: &mut [u8]| {
        let idx = get_idx(cx, cy, w);
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
    };

    let mut stack: Vec<(i32, i32)> = Vec::with_capacity(512);
    stack.push((x, y));

    while let Some((cx, cy)) = stack.pop() {
        let mut lx = cx;

        // Safe left scan using i32
        while lx >= 0 && match_target(lx, cy, data) {
            set_pixel(lx, cy, data);
            lx -= 1;
        }
        let left_bound = lx + 1;

        // Safe right scan (strictly less than width)
        let mut rx = cx + 1;
        while rx < w && match_target(rx, cy, data) {
            set_pixel(rx, cy, data);
            rx += 1;
        }
        let right_bound = rx - 1;

        let mut added_above_segment = false;
        let mut added_below_segment = false;

        for x_pos in left_bound..=right_bound {
            // Check row ABOVE (cy - 1)
            if cy > 0 {
                if match_target(x_pos, cy - 1, data) {
                    if !added_above_segment {
                        stack.push((x_pos, cy - 1));
                        added_above_segment = true;
                    }
                } else {
                    added_above_segment = false;
                }
            }

            // Check row BELOW (cy + 1)
            if cy < h - 1 {
                if match_target(x_pos, cy + 1, data) {
                    if !added_below_segment {
                        stack.push((x_pos, cy + 1));
                        added_below_segment = true;
                    }
                } else {
                    added_below_segment = false;
                }
            }
        }
    }
}
