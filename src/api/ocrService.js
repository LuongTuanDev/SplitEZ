import axios from 'axios';

// DÁN API KEY BẠN NHẬN ĐƯỢC TRONG MAIL VÀO ĐÂY (Lấy tại: https://ocr.space/ocrapi)
const OCR_SPACE_API_KEY = 'K88818917288957'; 
const API_URL = 'https://api.ocr.space/parse/image';

export const ocrService = {
  scanReceipt: async (base64Image) => {
    try {
      console.log("Đang quét hóa đơn bằng OCR.space...");
      
      // Đảm bảo có tiền tố base64
      const formattedBase64 = base64Image.includes('data:image') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;

      const formData = new FormData();
      formData.append('base64Image', formattedBase64);
      formData.append('apikey', OCR_SPACE_API_KEY);
      formData.append('language', 'eng'); // Dùng eng để ổn định nhất cho số tiền
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 giây timeout
      });

      if (response.data.OCRExitCode !== 1) {
        // Nếu dùng key mặc định bị giới hạn, thông báo cho người dùng
        const errorMsg = response.data.ErrorMessage || "Lỗi quét ảnh";
        if (errorMsg.includes('limit')) {
          throw new Error("Vui lòng thay API Key cá nhân trong mail để tiếp tục sử dụng.");
        }
        throw new Error(errorMsg);
      }

      const rawText = response.data.ParsedResults[0].ParsedText;
      console.log("Dữ liệu chữ thu được:", rawText);

      return parseRawText(rawText);
    } catch (error) {
      console.error("OCR Error:", error.message);
      throw error;
    }
  }
};

const parseRawText = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const items = [];
    let totalAmount = 0;
    let subtotal = 0;
    let discount = 0;
    let serviceFee = 0;
    let merchantName = "Hóa đơn mới";

    if (lines.length > 0) merchantName = lines[0];

    lines.forEach((line) => {
      const cleanLine = line.toLowerCase()
        .replace(/[on]{2,3}$/, '000') 
        .replace(/\s*[on]{2,3}\s*$/, '000')
        .replace(/[,.](\d{3})\b/g, '$1');

      const priceMatch = cleanLine.match(/(\d{3,10})$/);
      
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);
        const name = line.substring(0, line.lastIndexOf(priceMatch[1])).trim()
                        .replace(/[:.\-]/g, '').trim();

        const lowerName = name.toLowerCase();
        
        // Nhận diện Giảm giá
        if (lowerName.includes('giảm giá') || lowerName.includes('chiết khấu') || lowerName.includes('discount')) {
          discount = price;
        } 
        // Nhận diện Phí dịch vụ/VAT
        else if (lowerName.includes('phí') || lowerName.includes('service') || lowerName.includes('vat') || lowerName.includes('thuế')) {
          serviceFee += price;
        }
        // Nhận diện Tổng tiền
        else if (lowerName.includes('tổng') || lowerName.includes('cộng') || lowerName.includes('thanh toán')) {
          if (price > totalAmount) totalAmount = price;
        }
        // Các món ăn bình thường
        else if (price > 500 && name.length > 2) {
          items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            price: price
          });
          subtotal += price;
        }
      }
    });

    // Nếu không tìm thấy total, tính toán dựa trên các món
    if (totalAmount === 0) {
      totalAmount = subtotal + serviceFee - discount;
    }

    return {
      description: merchantName,
      totalAmount: totalAmount,
      subtotal: subtotal,
      discount: discount,
      serviceFee: serviceFee,
      items: items
    };
  };
