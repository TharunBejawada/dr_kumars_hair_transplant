import subprocess, io, os, math
from PIL import Image, ImageDraw, ImageFont

def generate_fixed_map():
    res = subprocess.run(['git', 'show', 'origin/main:apps/web/public/images/map.webp'], capture_output=True)
    base = Image.open(io.BytesIO(res.stdout)).convert('RGBA')

    # Font loading
    font_dir = 'C:/Windows/Fonts'
    f_title = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 27)
    f_sub = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 17)
    f_rating_val = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 18)
    f_rating_cnt = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 17)
    f_addr = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 16)
    f_status_b = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 16)
    f_status = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 16)
    f_btn = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 17)

    # Card dimensions matching original box
    card_x1, card_y1 = 18, 16
    card_x2, card_y2 = 582, 468
    radius = 14

    # Clean inside the card area
    c_clean = Image.new('RGBA', base.size, (0, 0, 0, 0))
    clean_draw = ImageDraw.Draw(c_clean)
    clean_draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=radius, fill=(255, 255, 255, 255))
    base = Image.alpha_composite(base, c_clean)

    # Draw subtle shadow and border
    card_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card_layer)
    c_draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=radius, fill=(255, 255, 255, 255), outline=(218, 220, 224, 255), width=1)

    # Text and elements
    tx = card_x1 + 32
    ty = card_y1 + 28

    # Title
    c_draw.text((tx, ty), "Dr. Kumar's Skin & Hair", font=f_title, fill=(32, 33, 36, 255))
    ty += 34
    c_draw.text((tx, ty), "Transplant Center", font=f_title, fill=(32, 33, 36, 255))
    ty += 36

    # Category
    c_draw.text((tx, ty), "Dermatologist in Kondapur, Hyderabad", font=f_sub, fill=(95, 99, 104, 255))
    ty += 30

    # Rating
    c_draw.text((tx, ty), "4.9", font=f_rating_val, fill=(32, 33, 36, 255))
    star_x = tx + 34

    # 5 vector stars
    def draw_star(draw, cx, cy, r_out, r_in, fill):
        pts = []
        for i in range(10):
            angle = i * math.pi / 5 - math.pi / 2
            r = r_out if i % 2 == 0 else r_in
            pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
        draw.polygon(pts, fill=fill)

    for i in range(5):
        draw_star(c_draw, star_x + i * 18, ty + 10, 8, 3.8, (227, 116, 0, 255))

    cnt_x = star_x + 5 * 18 + 8
    c_draw.text((cnt_x, ty), "(195)", font=f_rating_cnt, fill=(112, 117, 122, 255))
    ty += 30

    # Divider line
    c_draw.line([(tx, ty + 2), (card_x2 - 32, ty + 2)], fill=(232, 234, 237, 255), width=1)
    ty += 16

    # Address
    c_draw.text((tx, ty), "Plot No. 301, Above Ratnadeep Supermarket,", font=f_addr, fill=(60, 64, 67, 255))
    ty += 24
    c_draw.text((tx, ty), "Hanuman Nagar, K1 Promo Building,", font=f_addr, fill=(60, 64, 67, 255))
    ty += 24
    c_draw.text((tx, ty), "Kondapur, Hyderabad, Telangana 500084", font=f_addr, fill=(60, 64, 67, 255))
    ty += 28

    # Status with dot
    c_draw.text((tx, ty), "Open", font=f_status_b, fill=(24, 128, 56, 255))
    c_draw.ellipse([tx + 48, ty + 8, tx + 53, ty + 13], fill=(95, 99, 104, 255))
    c_draw.text((tx + 60, ty), "Closes 8:00 PM", font=f_status, fill=(95, 99, 104, 255))
    ty += 32

    # Action buttons
    # Button 1: Open in Maps (Google Blue Pill)
    btn_x1 = tx
    btn_y1 = ty
    btn_x2 = tx + 205
    btn_y2 = ty + 46
    c_draw.rounded_rectangle([btn_x1, btn_y1, btn_x2, btn_y2], radius=23, fill=(26, 115, 232, 255))

    # White navigation arrow
    arrow_cx = btn_x1 + 24
    arrow_cy = btn_y1 + 23
    c_draw.polygon([
        (arrow_cx - 6, arrow_cy - 7),
        (arrow_cx + 7, arrow_cy),
        (arrow_cx - 6, arrow_cy + 7),
        (arrow_cx - 2, arrow_cy)
    ], fill=(255, 255, 255, 255))
    c_draw.text((btn_x1 + 38, btn_y1 + 11), "Open in Maps", font=f_btn, fill=(255, 255, 255, 255))

    btn2_x1 = btn_x2 + 14
    btn2_x2 = btn2_x1 + 126
    c_draw.rounded_rectangle([btn2_x1, btn_y1, btn2_x2, btn_y2], radius=23, fill=(255, 255, 255, 255), outline=(218, 220, 224, 255), width=1)
    c_draw.text((btn2_x1 + 24, btn_y1 + 11), "Directions", font=f_btn, fill=(26, 115, 232, 255))

    final = Image.alpha_composite(base, card_layer)
    final.save('apps/web/public/images/map.webp', 'WEBP', quality=95)
    print("map.webp successfully updated!")

    def simulate_object_cover_left(im, target_w, target_h):
        im_w, im_h = im.size
        scale = max(target_w / im_w, target_h / im_h)
        new_w = int(round(im_w * scale))
        new_h = int(round(im_h * scale))
        resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        crop_x = 0
        crop_y = (new_h - target_h) // 2
        return resized.crop((crop_x, crop_y, crop_x + target_w, crop_y + target_h))

    sim = simulate_object_cover_left(final, 475, 438)
    sim.save('C:/Users/LENOVO/.gemini/antigravity/brain/0c35774c-81b8-4f06-b20b-0902c4370c33/sim_1024_v2.png')
    print("sim_1024_v2.png saved!")

if __name__ == '__main__':
    generate_fixed_map()
