/** The ring shows the fixture's 35 cm clearance radius; text/shape do not rely on colour. */
export function drawFloorAim(canvas: HTMLCanvasElement, valid: boolean): void {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#151B23';
    context.beginPath();
    context.arc(256, 256, 246, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = valid ? '#D7B67A' : '#F2F4F7';
    context.lineWidth = 12;
    context.stroke();
    context.beginPath();
    if (valid) {
        context.moveTo(216, 176);
        context.lineTo(256, 136);
        context.lineTo(296, 176);
        context.moveTo(256, 136);
        context.lineTo(256, 216);
    } else {
        context.moveTo(216, 136);
        context.lineTo(296, 216);
        context.moveTo(296, 136);
        context.lineTo(216, 216);
    }
    context.stroke();
    context.fillStyle = '#F2F4F7';
    context.font = '42px "Noto Sans", sans-serif';
    context.textAlign = 'center';
    context.fillText(valid ? 'Move here' : 'Blocked', 256, 290);
    context.font = '28px "Noto Sans", sans-serif';
    context.fillText(valid ? 'Confirm to move' : 'Choose clear floor', 256, 338);
}
