<div align="center">

# themeInit


**A personal theme by [initSyscall](https://codeberg.org/initsyscall).** Soothing deep purple color scheme designed for long coding sessions. Neither lifeless nor jarring—just perfectly balanced purples that protect your eyes while keeping you focused.


**Live at [themeInit](https://initsyscall.codeberg.page/themeInit)**

</div>


## Philosophy

This isn't intended to be the next Catppuccin. themeInit is my personal theme—just a cohesive purple palette that represents my workflow and identity. I'm making ports for the apps I use daily. If you vibe with it, you're welcome to port it to your favorites.

## Themes

### nightSyscall (Dark)
- Background: `#161423`
- Surface: `#201D33`
- Border: `#322D4A`
- Text Primary: `#E0DEF4`
- Text Secondary: `#908CAA`
- Text Muted: `#6E6A86`
- Accent Purple (kwd): `#A277FF`
- Function Red (fnc): `#FF3366`
- Type Lavender (typ): `#CBA6F7`
- String Pink (str): `#F087BD`
- Number Orange (num): `#F6C177`
- Operator Cyan (opr): `#80FFEA`

### daySyscall (Light)
- Background: `#FCF6F5`
- Surface: `#F2EAE9`
- Border: `#E0D1CF`
- Text Primary: `#45383C`
- Text Secondary: `#827075`
- Text Muted: `#A8959A`
- Accent Purple (kwd): `#752D7A`
- Function Red (fnc): `#D62846`
- Type Lavender (typ): `#9E4081`
- String Pink (str): `#D96677`
- Number Orange (num): `#B06A3B`
- Operator Cyan (opr): `#0F828A`

## Official Ports

| Platform | Status | Repository |
|----------|--------|------------|
| Website | ✓ Live | This repo |

Want to port themeInit to your favorite application? See the [Community Ports](#community-ports) section below.

## Usage

### CSS Variables

```css
:root {
  --bg: #161423;
  --surface: #201D33;
  --border: #322D4A;
  --textPrimary: #E0DEF4;
  --textSecondary: #908CAA;
  --textMuted: #6E6A86;
  --kwd: #A277FF;
  --fnc: #FF3366;
  --typ: #CBA6F7;
  --str: #F087BD;
  --num: #F6C177;
  --opr: #80FFEA;
}
```

### JSON Format

```json
{
  "name": "nightSyscall",
  "type": "dark",
  "colors": {
    "bg": "#161423",
    "surface": "#201D33",
    "border": "#322D4A",
    "textPrimary": "#E0DEF4",
    "textSecondary": "#908CAA",
    "textMuted": "#6E6A86",
    "kwd": "#A277FF",
    "fnc": "#FF3366",
    "typ": "#CBA6F7",
    "str": "#F087BD",
    "num": "#F6C177",
    "opr": "#80FFEA"
  }
}
```

## Community Ports

Have you ported themeInit to an application? Add it to `ports.json` and submit a pull request! Community ports are welcome and greatly appreciated.

See `ports.json` for the format and current community submissions.

## Contributing

1. Fork the repository
2. Create your port branch (`git checkout -b port/your-app`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - Free to use, modify, and distribute. Attribution appreciated.

---

*Made with ♥ by [initSyscall](https://codeberg.org/initsyscall)*
