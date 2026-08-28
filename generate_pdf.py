import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Smart Civic Resolution Platform — UI/UX Design Specification")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL — FOR INTERNAL GOVERNMENT USE ONLY")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf(md_filepath, pdf_filepath):
    doc = SimpleDocTemplate(
        pdf_filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#123B5D'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=18
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#123B5D'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#172033'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#172033'),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        spaceAfter=4
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F8FAFC'),
        borderColor=colors.HexColor('#E2E8F0'),
        borderWidth=1,
        borderPadding=8,
        spaceBefore=6,
        spaceAfter=10
    )

    cell_header_style = ParagraphStyle(
        'CellHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#FFFFFF')
    )

    cell_body_style = ParagraphStyle(
        'CellBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#172033')
    )

    elements = []
    
    with open(md_filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code_block = False
    code_lines = []
    in_table = False
    table_data = []

    for line in lines:
        raw_line = line.rstrip('\n')
        
        # Code block handling
        if raw_line.startswith('```'):
            if in_code_block:
                code_text = "<br/>".join(code_lines).replace(" ", "&nbsp;")
                elements.append(Paragraph(code_text, code_style))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            continue
            
        if in_code_block:
            escaped = raw_line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            code_lines.append(escaped)
            continue
            
        # Table handling
        if raw_line.startswith('|'):
            if '---' in raw_line:
                continue
            cells = [c.strip() for c in raw_line.split('|')[1:-1]]
            if cells:
                in_table = True
                table_data.append(cells)
            continue
        elif in_table:
            # End of table
            if table_data:
                # Build reportlab table
                formatted_data = []
                for row_idx, row in enumerate(table_data):
                    formatted_row = []
                    for cell in row:
                        style = cell_header_style if row_idx == 0 else cell_body_style
                        # replace markdown bold
                        cell_clean = cell.replace('**', '')
                        formatted_row.append(Paragraph(cell_clean, style))
                    formatted_data.append(formatted_row)
                
                t = Table(formatted_data, colWidths=None)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#123B5D')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#FFFFFF')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
                ]))
                elements.append(t)
                elements.append(Spacer(1, 10))
                table_data = []
                in_table = False
                
        # Normal lines
        stripped = raw_line.strip()
        if not stripped:
            continue
            
        if stripped.startswith('# '):
            elements.append(Paragraph(stripped[2:].replace('**', ''), title_style))
            elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#123B5D'), spaceBefore=2, spaceAfter=12))
        elif stripped.startswith('## '):
            elements.append(Paragraph(stripped[3:].replace('**', ''), h1_style))
            elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceBefore=2, spaceAfter=8))
        elif stripped.startswith('### '):
            elements.append(Paragraph(stripped[4:].replace('**', ''), h2_style))
        elif stripped.startswith('---'):
            elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceBefore=8, spaceAfter=8))
        elif stripped.startswith('- ') or stripped.startswith('* '):
            text = stripped[2:]
            # format bold
            text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
            elements.append(Paragraph(f"• {text}", bullet_style))
        else:
            text = stripped.replace('**', '<b>', 1).replace('**', '</b>', 1)
            elements.append(Paragraph(text, body_style))

    # Clean up trailing table if file ends with table
    if in_table and table_data:
        formatted_data = []
        for row_idx, row in enumerate(table_data):
            formatted_row = []
            for cell in row:
                style = cell_header_style if row_idx == 0 else cell_body_style
                cell_clean = cell.replace('**', '')
                formatted_row.append(Paragraph(cell_clean, style))
            formatted_data.append(formatted_row)
        t = Table(formatted_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#123B5D')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0'))
        ]))
        elements.append(t)

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {pdf_filepath}")

if __name__ == '__main__':
    md_path = r"c:\Users\neela\OneDrive\Desktop\viksit project\design.md"
    pdf_path = r"c:\Users\neela\OneDrive\Desktop\viksit project\design.pdf"
    build_pdf(md_path, pdf_path)
