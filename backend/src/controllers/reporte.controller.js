const ExcelJS      = require('exceljs');
const PDFDocument  = require('pdfkit');
const sequelize    = require('../config/database');

// ── Paleta corporativa ────────────────────────────────────────────────────────
const C = {
  dark:    '1E293B',   // slate-800
  mid:     '334155',   // slate-700
  muted:   '64748B',   // slate-500
  accent:  '4F46E5',   // indigo-600
  accentL: 'EEF2FF',   // indigo-50
  light:   'F8FAFC',   // slate-50
  white:   'FFFFFF',
  border:  'CBD5E1',   // slate-300
  green:   '16A34A',
  red:     'DC2626',
};

// ── Query consolidado (subconsultas para evitar producto cartesiano) ───────────
const QUERY = `
SELECT
  E.id_evento,
  E.nombre_evento,
  ISNULL(TE.nombre, 'Sin tipo')                     AS tipo_evento,
  E.estado_evento,
  ISNULL(E.modalidad_evento, '')                    AS modalidad_evento,
  CONVERT(VARCHAR(10), E.fecha_inicio,  23)         AS fecha_inicio,
  CONVERT(VARCHAR(10), E.fecha_termino, 23)         AS fecha_termino,
  ISNULL(E.aforo_maximo, 0)                         AS aforo_maximo,
  ISNULL(E.ubicacion_texto, '')                     AS ubicacion,
  -- Asistencia
  ISNULL((SELECT COUNT(*)   FROM INVITADOS_RSVP IR WHERE IR.id_evento = E.id_evento), 0)                                       AS total_registros,
  ISNULL((SELECT COUNT(*)   FROM INVITADOS_RSVP IR WHERE IR.id_evento = E.id_evento AND IR.estado_invitado = N'Confirmado'), 0) AS confirmados,
  ISNULL((SELECT COUNT(*)   FROM INVITADOS_RSVP IR WHERE IR.id_evento = E.id_evento AND IR.estado_invitado = N'Ingresado'),  0) AS ingresados,
  ISNULL((SELECT COUNT(*)   FROM INVITADOS_RSVP IR WHERE IR.id_evento = E.id_evento AND IR.estado_invitado = N'Rechazado'),  0) AS rechazados,
  -- Presupuesto egresos
  ISNULL((SELECT SUM(PI.monto_estimado)                         FROM PRESUPUESTO_ITEMS PI WHERE PI.id_evento = E.id_evento AND PI.tipo = N'Egreso'), 0) AS egreso_estimado,
  ISNULL((SELECT SUM(ISNULL(PI.monto_real, PI.monto_estimado)) FROM PRESUPUESTO_ITEMS PI WHERE PI.id_evento = E.id_evento AND PI.tipo = N'Egreso'), 0) AS egreso_real,
  -- Presupuesto ingresos
  ISNULL((SELECT SUM(PI.monto_estimado)                         FROM PRESUPUESTO_ITEMS PI WHERE PI.id_evento = E.id_evento AND PI.tipo = N'Ingreso'), 0) AS ingreso_estimado,
  ISNULL((SELECT SUM(ISNULL(PI.monto_real, PI.monto_estimado)) FROM PRESUPUESTO_ITEMS PI WHERE PI.id_evento = E.id_evento AND PI.tipo = N'Ingreso'), 0) AS ingreso_real
FROM EVENTOS E
LEFT JOIN TIPOS_EVENTO TE ON TE.id_tipo = E.id_tipo
ORDER BY E.fecha_inicio DESC
`;

async function getReporteData() {
  const [rows] = await sequelize.query(QUERY);
  return rows.map(r => ({
    ...r,
    aforo_maximo:     Number(r.aforo_maximo),
    total_registros:  Number(r.total_registros),
    confirmados:      Number(r.confirmados),
    ingresados:       Number(r.ingresados),
    rechazados:       Number(r.rechazados),
    egreso_estimado:  Number(r.egreso_estimado),
    egreso_real:      Number(r.egreso_real),
    ingreso_estimado: Number(r.ingreso_estimado),
    ingreso_real:     Number(r.ingreso_real),
    ahorro:           Number(r.egreso_estimado) - Number(r.egreso_real),
    balance:          Number(r.ingreso_real)    - Number(r.egreso_real),
    pct_asistencia:   r.aforo_maximo > 0
                        ? Math.round((Number(r.ingresados) / Number(r.aforo_maximo)) * 100)
                        : 0,
  }));
}

function totales(rows) {
  return rows.reduce((a, r) => ({
    total_registros:  a.total_registros  + r.total_registros,
    ingresados:       a.ingresados       + r.ingresados,
    egreso_estimado:  a.egreso_estimado  + r.egreso_estimado,
    egreso_real:      a.egreso_real      + r.egreso_real,
    ingreso_real:     a.ingreso_real     + r.ingreso_real,
    ahorro:           a.ahorro           + r.ahorro,
    balance:          a.balance          + r.balance,
  }), { total_registros: 0, ingresados: 0, egreso_estimado: 0, egreso_real: 0, ingreso_real: 0, ahorro: 0, balance: 0 });
}

// ── Helper ExcelJS ────────────────────────────────────────────────────────────
function headerFill(color) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
}
function font(color, size = 10, bold = false) {
  return { name: 'Calibri', size, bold, color: { argb: 'FF' + color } };
}
function border() {
  const s = { style: 'thin', color: { argb: 'FF' + C.border } };
  return { top: s, left: s, bottom: s, right: s };
}
function clp(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

// ── EXCEL ─────────────────────────────────────────────────────────────────────
async function exportarExcel(req, res, next) {
  try {
    const rows = await getReporteData();
    const t    = totales(rows);
    const hoy  = new Intl.DateTimeFormat('es-CL').format(new Date());

    const wb = new ExcelJS.Workbook();
    wb.creator  = 'Convexa';
    wb.created  = new Date();

    // ── Hoja 1: Resumen Ejecutivo ──────────────────────────────────────────
    const ws1 = wb.addWorksheet('Resumen Ejecutivo', {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    });

    // Título
    ws1.mergeCells('A1:M1');
    const titleCell = ws1.getCell('A1');
    titleCell.value      = 'CONVEXA — Reporte Consolidado de Eventos';
    titleCell.font       = font(C.white, 14, true);
    titleCell.fill       = headerFill(C.dark);
    titleCell.alignment  = { horizontal: 'center', vertical: 'middle' };
    ws1.getRow(1).height = 30;

    ws1.mergeCells('A2:M2');
    const subCell = ws1.getCell('A2');
    subCell.value     = `Generado el ${hoy} · ${rows.length} evento(s)`;
    subCell.font      = font(C.muted, 9);
    subCell.fill      = headerFill(C.light);
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws1.getRow(2).height = 18;

    // KPI strip (row 3)
    const kpis = [
      { label: 'Eventos',       value: rows.length,       cols: 'A3:C3' },
      { label: 'Total Registros', value: t.total_registros, cols: 'D3:F3' },
      { label: 'Asistentes',    value: t.ingresados,       cols: 'G3:I3' },
      { label: 'Balance Neto',  value: clp(t.balance),     cols: 'J3:M3' },
    ];
    kpis.forEach(({ label, value, cols }) => {
      ws1.mergeCells(cols);
      const cell = ws1.getCell(cols.split(':')[0]);
      cell.value     = `${label}\n${value}`;
      cell.font      = font(C.accent, 11, true);
      cell.fill      = headerFill(C.accentL);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border    = border();
    });
    ws1.getRow(3).height = 40;

    // Encabezados de tabla
    const COLS_R = [
      { header: 'Nº',               key: 'n',                width: 5  },
      { header: 'Evento',           key: 'nombre_evento',    width: 28 },
      { header: 'Tipo',             key: 'tipo_evento',      width: 16 },
      { header: 'Estado',           key: 'estado_evento',    width: 14 },
      { header: 'Fecha Inicio',     key: 'fecha_inicio',     width: 13 },
      { header: 'Aforo',            key: 'aforo_maximo',     width: 9  },
      { header: 'Registros',        key: 'total_registros',  width: 11 },
      { header: 'Ingresados',       key: 'ingresados',       width: 11 },
      { header: '% Asistencia',     key: 'pct_asistencia',   width: 13 },
      { header: 'Egreso Estimado',  key: 'egreso_estimado',  width: 17 },
      { header: 'Egreso Real',      key: 'egreso_real',      width: 15 },
      { header: 'Ahorro',           key: 'ahorro',           width: 14 },
      { header: 'Balance',          key: 'balance',          width: 14 },
    ];
    ws1.columns = COLS_R;

    const hRow = ws1.getRow(4);
    hRow.values = COLS_R.map(c => c.header);
    hRow.eachCell(cell => {
      cell.font      = font(C.white, 10, true);
      cell.fill      = headerFill(C.mid);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = border();
    });
    hRow.height = 20;

    rows.forEach((r, i) => {
      const row = ws1.addRow([
        i + 1,
        r.nombre_evento,
        r.tipo_evento,
        r.estado_evento,
        r.fecha_inicio,
        r.aforo_maximo || '—',
        r.total_registros,
        r.ingresados,
        r.pct_asistencia / 100,
        r.egreso_estimado,
        r.egreso_real,
        r.ahorro,
        r.balance,
      ]);
      const bg = i % 2 === 0 ? C.white : C.light;
      row.eachCell((cell, ci) => {
        cell.fill   = headerFill(bg);
        cell.border = border();
        cell.font   = font(C.dark, 10);
        cell.alignment = { vertical: 'middle', horizontal: ci === 2 ? 'left' : 'center' };
      });
      // Formato moneda en columnas J-M (10-13)
      [10, 11, 12, 13].forEach(ci => {
        const cell = row.getCell(ci);
        cell.numFmt    = '#,##0';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (ci === 12 || ci === 13) {
          const val = cell.value;
          cell.font = font(val >= 0 ? C.green : C.red, 10, true);
        }
      });
      row.getCell(9).numFmt = '0%';
    });

    // Fila de totales
    const tRow = ws1.addRow([
      '', 'TOTALES', '', '', '', '',
      t.total_registros, t.ingresados, '',
      t.egreso_estimado, t.egreso_real, t.ahorro, t.balance,
    ]);
    tRow.eachCell(cell => {
      cell.fill   = headerFill(C.dark);
      cell.font   = font(C.white, 10, true);
      cell.border = border();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    [10, 11, 12, 13].forEach(ci => { tRow.getCell(ci).numFmt = '#,##0'; });

    // ── Hoja 2: Detalle Asistencia ─────────────────────────────────────────
    const ws2 = wb.addWorksheet('Asistencia');
    ws2.mergeCells('A1:G1');
    const t2 = ws2.getCell('A1');
    t2.value = 'Detalle de Asistencia por Evento';
    t2.font  = font(C.white, 12, true); t2.fill = headerFill(C.dark);
    t2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws2.getRow(1).height = 26;

    ws2.columns = [
      { header: 'Evento',          key: 'nombre_evento',   width: 32 },
      { header: 'Aforo Máximo',    key: 'aforo_maximo',    width: 14 },
      { header: 'Total Registros', key: 'total_registros', width: 16 },
      { header: 'Confirmados',     key: 'confirmados',     width: 14 },
      { header: 'Ingresados',      key: 'ingresados',      width: 14 },
      { header: 'Rechazados',      key: 'rechazados',      width: 14 },
      { header: '% Asistencia',    key: 'pct_asistencia',  width: 14 },
    ];
    const h2 = ws2.getRow(2);
    h2.values = ['Evento', 'Aforo Máximo', 'Total Registros', 'Confirmados', 'Ingresados', 'Rechazados', '% Asistencia'];
    h2.eachCell(c => { c.font = font(C.white, 10, true); c.fill = headerFill(C.mid); c.border = border(); c.alignment = { horizontal: 'center' }; });

    rows.forEach((r, i) => {
      const row = ws2.addRow([r.nombre_evento, r.aforo_maximo || '—', r.total_registros, r.confirmados, r.ingresados, r.rechazados, r.pct_asistencia / 100]);
      row.eachCell(c => { c.fill = headerFill(i % 2 === 0 ? C.white : C.light); c.border = border(); c.font = font(C.dark, 10); c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      row.getCell(7).numFmt = '0%';
    });

    // ── Hoja 3: Detalle Presupuesto ────────────────────────────────────────
    const ws3 = wb.addWorksheet('Presupuesto');
    ws3.mergeCells('A1:G1');
    const t3 = ws3.getCell('A1');
    t3.value = 'Detalle Presupuestario por Evento';
    t3.font  = font(C.white, 12, true); t3.fill = headerFill(C.dark);
    t3.alignment = { horizontal: 'center', vertical: 'middle' };
    ws3.getRow(1).height = 26;

    ws3.columns = [
      { header: 'Evento',           key: 'nombre_evento',   width: 32 },
      { header: 'Egreso Estimado',  key: 'egreso_estimado', width: 18 },
      { header: 'Egreso Real',      key: 'egreso_real',     width: 16 },
      { header: 'Ahorro',           key: 'ahorro',          width: 14 },
      { header: 'Ingreso Estimado', key: 'ingreso_estimado',width: 18 },
      { header: 'Ingreso Real',     key: 'ingreso_real',    width: 16 },
      { header: 'Balance Neto',     key: 'balance',         width: 16 },
    ];
    const h3 = ws3.getRow(2);
    h3.values = ['Evento', 'Egreso Estimado', 'Egreso Real', 'Ahorro', 'Ingreso Estimado', 'Ingreso Real', 'Balance Neto'];
    h3.eachCell(c => { c.font = font(C.white, 10, true); c.fill = headerFill(C.mid); c.border = border(); c.alignment = { horizontal: 'center' }; });

    rows.forEach((r, i) => {
      const row = ws3.addRow([r.nombre_evento, r.egreso_estimado, r.egreso_real, r.ahorro, r.ingreso_estimado, r.ingreso_real, r.balance]);
      row.eachCell(c => { c.fill = headerFill(i % 2 === 0 ? C.white : C.light); c.border = border(); c.font = font(C.dark, 10); c.alignment = { horizontal: 'right', vertical: 'middle' }; });
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      for (let ci = 2; ci <= 7; ci++) {
        const cell = row.getCell(ci);
        cell.numFmt = '#,##0';
        if ((ci === 4 || ci === 7) && typeof cell.value === 'number') {
          cell.font = font(cell.value >= 0 ? C.green : C.red, 10, true);
        }
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_Convexa_${Date.now()}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

// ── PDF ───────────────────────────────────────────────────────────────────────
const pdfClp = n => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

function drawPdfTable(doc, headers, rows, startX, startY, colWidths) {
  const rowH    = 20;
  const headerH = 22;
  let y = startY;

  // Encabezado
  doc.save();
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), headerH).fill('#334155');
  let x = startX;
  headers.forEach((h, i) => {
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
       .text(h, x + 4, y + 7, { width: colWidths[i] - 8, align: 'center', lineBreak: false });
    x += colWidths[i];
  });
  y += headerH;
  doc.restore();

  // Filas
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    const totalW = colWidths.reduce((a, b) => a + b, 0);

    // Nueva página si no cabe
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }

    doc.rect(startX, y, totalW, rowH).fill(bg).stroke('#CBD5E1');
    let cx = startX;
    row.forEach((cell, ci) => {
      const isNum = typeof cell === 'number' || (typeof cell === 'string' && cell.startsWith('$'));
      const color  = cell !== null && typeof cell === 'number' && (ci === 3 || ci === 6)
        ? cell >= 0 ? '#16A34A' : '#DC2626'
        : '#1E293B';
      doc.fillColor(color).fontSize(8).font(
        (ci === 3 || ci === 6) ? 'Helvetica-Bold' : 'Helvetica'
      ).text(
        cell === null || cell === undefined ? '—' : String(cell),
        cx + 4, y + 6,
        { width: colWidths[ci] - 8, align: isNum ? 'right' : 'left', lineBreak: false }
      );
      cx += colWidths[ci];
    });
    y += rowH;
  });

  return y;
}

async function exportarPdf(req, res, next) {
  try {
    const rows = await getReporteData();
    const t    = totales(rows);
    const hoy  = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_Convexa_${Date.now()}.pdf"`);
    doc.pipe(res);

    const W    = doc.page.width;    // ~841
    const MARG = 30;
    const CW   = W - MARG * 2;     // ~781

    // ── Cabecera ──────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 70).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
       .text('CONVEXA', MARG, 15, { width: CW });
    doc.fillColor('#A5B4FC').fontSize(10).font('Helvetica')
       .text('Reporte Consolidado de Eventos y Finanzas', MARG, 38, { width: CW });
    doc.fillColor('#94A3B8').fontSize(8)
       .text(`Generado el ${hoy}`, MARG, 54, { width: CW });

    let y = 85;

    // ── KPI blocks ────────────────────────────────────────────────────────
    const kpiW = (CW - 15) / 4;
    const kpis = [
      { label: 'Eventos totales',     value: String(rows.length)      },
      { label: 'Total asistentes',    value: String(t.ingresados)     },
      { label: 'Egresos ejecutados',  value: pdfClp(t.egreso_real)    },
      { label: 'Balance neto',        value: pdfClp(t.balance)        },
    ];
    kpis.forEach((k, i) => {
      const kx = MARG + i * (kpiW + 5);
      doc.roundedRect(kx, y, kpiW, 48, 4).fill('#EEF2FF').stroke('#C7D2FE');
      doc.fillColor('#4F46E5').fontSize(7).font('Helvetica')
         .text(k.label.toUpperCase(), kx + 8, y + 8, { width: kpiW - 16 });
      const isBalance = i === 3;
      const color = isBalance ? (t.balance >= 0 ? '#16A34A' : '#DC2626') : '#1E293B';
      doc.fillColor(color).fontSize(13).font('Helvetica-Bold')
         .text(k.value, kx + 8, y + 20, { width: kpiW - 16 });
    });
    y += 65;

    // ── Tabla principal ────────────────────────────────────────────────────
    doc.fillColor('#1E293B').fontSize(11).font('Helvetica-Bold')
       .text('Resumen por Evento', MARG, y);
    y += 16;

    const headers  = ['Evento', 'Estado', 'Fecha', 'Aforo', 'Registros', 'Ingresados', '% Asis.', 'Egreso Est.', 'Egreso Real', 'Ahorro', 'Balance'];
    const colWidths = [160, 70, 68, 45, 55, 60, 45, 80, 75, 70, 73];

    const tableRows = rows.map(r => [
      r.nombre_evento.length > 28 ? r.nombre_evento.slice(0, 26) + '…' : r.nombre_evento,
      r.estado_evento,
      r.fecha_inicio || '—',
      r.aforo_maximo || '—',
      r.total_registros,
      r.ingresados,
      `${r.pct_asistencia}%`,
      pdfClp(r.egreso_estimado),
      pdfClp(r.egreso_real),
      r.ahorro,
      r.balance,
    ]);

    y = drawPdfTable(doc, headers, tableRows, MARG, y, colWidths);
    y += 10;

    // Fila de totales
    if (y + 22 > doc.page.height - 60) { doc.addPage(); y = 40; }
    doc.rect(MARG, y, CW, 22).fill('#1E293B');
    const totCells = ['TOTALES', '', '', '', t.total_registros, t.ingresados, '', pdfClp(t.egreso_estimado), pdfClp(t.egreso_real), pdfClp(t.ahorro), pdfClp(t.balance)];
    let tx = MARG;
    totCells.forEach((cell, ci) => {
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
         .text(String(cell), tx + 4, y + 7, { width: colWidths[ci] - 8, align: ci === 0 ? 'left' : 'right', lineBreak: false });
      tx += colWidths[ci];
    });
    y += 30;

    // ── Footer ────────────────────────────────────────────────────────────
    const FY = doc.page.height - 25;
    doc.rect(0, FY - 5, W, 30).fill('#1E293B');
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica')
       .text('Convexa · Sistema de Gestión de Eventos · Documento confidencial', MARG, FY, { width: CW, align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { exportarExcel, exportarPdf };
