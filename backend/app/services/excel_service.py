import os
from datetime import datetime, timezone
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from app.core.config import settings
from app.services.parser_service import clean_candidate_name, clean_candidate_location

def generate_excel_report(report_name: str, candidate_data: list[dict]) -> str:
    filename = f"{report_name.replace(' ', '_')}_{int(datetime.now().timestamp())}.xlsx"
    filepath = os.path.join(settings.REPORTS_DIR, filename)

    rows = []
    for item in candidate_data:
        raw_name = item.get("name") or "Candidate"
        email = item.get("email") or ""
        phone = item.get("phone") or ""
        resume_file = item.get("file_name") or item.get("resume_file") or ""
        raw_loc = item.get("location") or ""
        raw_text = item.get("raw_text") or ""

        # Apply strict cleaning on export
        clean_name = clean_candidate_name(raw_name, resume_file, email, raw_text)
        clean_loc = clean_candidate_location(raw_loc, raw_text)

        rows.append({
            "Candidate Name": clean_name,
            "Email": email,
            "Phone Number": phone,
            "Resume File": resume_file,
            "Location": clean_loc
        })

    if not rows:
        rows.append({
            "Candidate Name": "N/A",
            "Email": "N/A",
            "Phone Number": "N/A",
            "Resume File": "N/A",
            "Location": "N/A"
        })

    df = pd.DataFrame(rows)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Candidate Summary"

    # Explicitly show gridlines
    ws.views.sheetView[0].showGridLines = True

    # Freeze header row
    ws.freeze_panes = "A2"

    # Define Styles
    header_fill = PatternFill(start_color="0B132B", end_color="0B132B", fill_type="solid")
    header_font = Font(name="Calibri", size=12, bold=True, color="FFFFFF")
    
    even_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    odd_row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    data_font = Font(name="Calibri", size=11, color="1E293B")
    email_font = Font(name="Calibri", size=11, color="2563EB", underline="single")

    thin_border = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1")
    )

    header_border = Border(
        left=Side(style="thin", color="1E293B"),
        right=Side(style="thin", color="1E293B"),
        top=Side(style="medium", color="0B132B"),
        bottom=Side(style="medium", color="0047AB")
    )

    headers = list(df.columns)
    ws.append(headers)
    ws.row_dimensions[1].height = 32

    for col_num, header_name in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = header_border
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for row_idx, row_data in enumerate(rows, start=2):
        ws.append([
            row_data["Candidate Name"],
            row_data["Email"],
            row_data["Phone Number"],
            row_data["Resume File"],
            row_data["Location"]
        ])
        ws.row_dimensions[row_idx].height = 24
        fill = even_row_fill if row_idx % 2 == 0 else odd_row_fill

        for col_num in range(1, 6):
            cell = ws.cell(row=row_idx, column=col_num)
            cell.fill = fill
            cell.border = thin_border
            
            if col_num in [1, 4]:  # Candidate Name, Resume File
                cell.alignment = Alignment(horizontal="left", vertical="center")
                cell.font = data_font
            elif col_num == 2:  # Email
                cell.alignment = Alignment(horizontal="left", vertical="center")
                cell.font = email_font if "@" in str(cell.value) else data_font
            else:  # Phone Number, Location
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = data_font

    for col in ws.columns:
        max_len = 0
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 6, 22), 55)

    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    wb.save(filepath)
    return filepath
