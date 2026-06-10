# Image assets

The site renders elegant gradient **placeholders** until real photos exist here.
To use real photography, simply drop image files into this folder using the exact
filenames below — **no code changes are required**. The `<Photo>` component will
detect and fade them in automatically.

Recommended: high-quality JPGs, optimized for web (≈1600px wide, < 400 KB each).

| Filename                       | Used for                          | Suggested ratio |
| ------------------------------ | --------------------------------- | --------------- |
| `hero.jpg`                     | Home hero + booking hero          | 16:9 (wide)     |
| `about.jpg`                    | About page + home "Our Story"     | 4:5 (portrait)  |
| `wedding.jpg`                  | Weddings event-type card          | 4:5 (portrait)  |
| `corporate.jpg`                | Corporate event-type card         | 4:5 (portrait)  |
| `birthday.jpg`                 | Birthdays event-type card         | 4:5 (portrait)  |
| `private-party.jpg`            | Private Parties event-type card   | 4:5 (portrait)  |
| `portfolio-reception.jpg`      | Portfolio                         | 3:2             |
| `portfolio-floral.jpg`         | Portfolio                         | 3:2             |
| `portfolio-place-setting.jpg`  | Portfolio                         | 3:2             |
| `portfolio-venue.jpg`          | Portfolio                         | 3:2             |
| `portfolio-corporate.jpg`      | Portfolio                         | 3:2             |
| `cta.jpg`                      | Call-to-action band               | 21:9 (panorama) |

You can change which file each section uses by editing the `image` fields in
`src/data/eventTypes.js` and `src/data/portfolio.js`.
