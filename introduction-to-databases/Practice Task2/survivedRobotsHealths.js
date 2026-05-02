/**
 * Robot Collisions — survivedRobotsHealths
 *
 * Given:
 * - pos[i] = position of robot i
 * - h[i]   = health of robot i
 * - d[i]   = direction of robot i: 'L' or 'R'
 *
 * When a 'R' robot meets a 'L' robot, they collide:
 * - Higher health survives and loses 1 health
 * - Lower health robot dies
 * - If equal, both die
 *
 * Return the healths of surviving robots in the original index order.
 *
 * Time: O(n log n) due to sorting by position
 * Space: O(n)
 */

function survivedRobotsHealths(pos, h, d) {
  const n = pos.length;
  const order = Array.from({ length: n }, (_, i) => i);

  order.sort((a, b) => pos[a] - pos[b]);

  const alive = Array(n).fill(true);
  const stack = []; // indices of right-moving robots (in position order)

  for (const idx of order) {
    if (d[idx] === 'R') {
      stack.push(idx);
      continue;
    }

    // d[idx] === 'L'
    while (stack.length > 0) {
      const top = stack[stack.length - 1];

      if (h[top] < h[idx]) {
        alive[top] = false;
        stack.pop();
        h[idx] -= 1;
        continue;
      }

      if (h[top] > h[idx]) {
        alive[idx] = false;
        h[top] -= 1;
        break;
      }

      // equal health
      alive[top] = false;
      alive[idx] = false;
      stack.pop();
      break;
    }
  }

  const res = [];
  for (let i = 0; i < n; i++) {
    if (alive[i]) res.push(h[i]);
  }
  return res;
}

if (require.main === module) {
  // Minimal demo (adjust inputs as needed)
  const pos = [1, 2, 5, 6];
  const h = [10, 10, 11, 11];
  const d = 'RRL L'.replace(/\s/g, '');

  console.log(survivedRobotsHealths(pos, h, d));
}

module.exports = { survivedRobotsHealths };
