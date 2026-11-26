import subprocess, io, os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_fixed_map():
    res = subprocess.run(['git', 'show', '82f1e3d:apps/web/public/images/map.webp'], capture_output=True)
    base = Image.open(io.BytesIO(res.stdout)).convert('RGBA')

    font_dir = 'C:/Windows/Fonts'
    f_title = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 26)
    f_sub = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 17)
    f_rating_val = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 18)
    f_rating_cnt = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 17)
    f_addr = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 16)
    f_status_b = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 16)
    f_status = ImageFont.truetype(os.path.join(font_dir, 'segoeui.ttf'), 16)
    f_btn = ImageFont.truetype(os.path.join(font_dir, 'segoeuib.ttf'), 17)

    # Compact card: ends 22px below action buttons, eliminating bottom blank space
    c_x1, c_y1 = 18, 16
    c_x2 = 520
    c_y2 = 368
    radius = 14

    # Clean the old card area below y=368 into the map
    clean_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    cl_draw = ImageDraw.Draw(clean_layer)
    cl_draw.rectangle([0, 0, 588, 475], fill=(245, 247, 248, 255))
    
    # Road continuing from y=475 upwards into the map
    cl_draw.line([(180, 475), (140, 360)], fill=(255, 255, 255, 255), width=10)
    cl_draw.line([(175, 475), (135, 360)], fill=(225, 228, 230, 255), width=1)
    cl_draw.line([(185, 475), (145, 360)], fill=(225, 228, 230, 255), width=1)

    base = Image.alpha_composite(base, clean_layer)

    # Draw card shadow
    shadow_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.rounded_rectangle([c_x1 - 1, c_y1 + 1, c_x2 + 2, c_y2 + 6], radius=radius + 2, fill=(0, 0, 0, 45))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=5))

    # Draw compact card body
    card_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card_layer)
    c_draw.rounded_rectangle([c_x1, c_y1, c_x2, c_y2], radius=radius, fill=(255, 255, 255, 255), outline=(218, 220, 224, 255), width=1)

    # Content positioning
    tx = c_x1 + 28
    ty = c_y1 + 24

    c_draw.text((tx, ty), "Dr. Kumar's Skin & Hair", font=f_title, fill=(32, 33, 36, 255))
    ty += 32
    c_draw.text((tx, ty), "Transplant Center", font=f_title, fill=(32, 33, 36, 255))
    ty += 36

    c_draw.text((tx, ty), "Dermatologist in Kondapur, Hyderabad", font=f_sub, fill=(95, 99, 104, 255))
    ty += 30

    c_draw.text((tx, ty), "4.9", font=f_rating_val, fill=(32, 33, 36, 255))
    star_x = tx + 34
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
    ty += 28

    c_draw.line([(tx, ty + 2), (c_x2 - 28, ty + 2)], fill=(232, 234, 237, 255), width=1)
    ty += 14

    c_draw.text((tx, ty), "Plot No. 301, Above Ratnadeep Supermarket,", font=f_addr, fill=(60, 64, 67, 255))
    ty += 23
    c_draw.text((tx, ty), "Hanuman Nagar, K1 Promo Building,", font=f_addr, fill=(60, 64, 67, 255))
    ty += 23
    c_draw.text((tx, ty), "Kondapur, Hyderabad, Telangana 500084", font=f_addr, fill=(60, 64, 67, 255))
    ty += 26

    c_draw.text((tx, ty), "Open", font=f_status_b, fill=(24, 128, 56, 255))
    c_draw.ellipse([tx + 46, ty + 7, tx + 51, ty + 12], fill=(95, 99, 104, 255))
    c_draw.text((tx + 58, ty), "Closes 8:00 PM", font=f_status, fill=(95, 99, 104, 255))
    ty += 30

    btn_x1 = tx
    btn_y1 = ty
    btn_x2 = tx + 195
    btn_y2 = ty + 44
    c_draw.rounded_rectangle([btn_x1, btn_y1, btn_x2, btn_y2], radius=22, fill=(26, 115, 232, 255))

    arrow_cx = btn_x1 + 22
    arrow_cy = btn_y1 + 22
    c_draw.polygon([
        (arrow_cx - 6, arrow_cy - 7),
        (arrow_cx + 7, arrow_cy),
        (arrow_cx - 6, arrow_cy + 7),
        (arrow_cx - 2, arrow_cy)
    ], fill=(255, 255, 255, 255))
    c_draw.text((btn_x1 + 36, btn_y1 + 10), "Open in Maps", font=f_btn, fill=(255, 255, 255, 255))

    btn2_x1 = btn_x2 + 12
    btn2_x2 = btn2_x1 + 120
    c_draw.rounded_rectangle([btn2_x1, btn_y1, btn2_x2, btn_y2], radius=22, fill=(255, 255, 255, 255), outline=(218, 220, 224, 255), width=1)
    c_draw.text((btn2_x1 + 22, btn_y1 + 10), "Directions", font=f_btn, fill=(26, 115, 232, 255))

    final = Image.alpha_composite(base, shadow_layer)
    final = Image.alpha_composite(final, card_layer)

    final.save('apps/web/public/images/map.webp', 'WEBP', quality=95)
    print("map.webp successfully updated with compact card (blank space removed)!")

if __name__ == '__main__':
    generate_fixed_map()
