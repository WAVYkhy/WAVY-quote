// --- Security Utility: HTML Sanitizer to prevent DOM XSS ---
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let currentLang = 'ko';
let isLangTransitioning = false;
let currentStep = 1;
let exchangeRates = { USD: 0.00072, JPY: 0.11 }; // Fallback defaults

fetch('https://open.er-api.com/v6/latest/KRW')
    .then(res => res.json())
    .then(data => {
        if (data && data.rates) {
            exchangeRates.USD = data.rates.USD || exchangeRates.USD;
            exchangeRates.JPY = data.rates.JPY || exchangeRates.JPY;
        }
        calculateTotal();
    })
    .catch(err => {
        console.warn("Exchange rate fetch failed, using fallback defaults", err);
        calculateTotal();
    });

const i18n = {
    ko: {
        curr: "원",
        headerDesc: "상세 내역을 선택하고 입력하시면 예상 견적을 즉시 확인할 수 있습니다.",
        step1: "견적 산출 & 마감일", step2: "프로젝트 상세 작성",
        btnNext1: "다음 단계 (02. 상세 자료 작성) →", btnPrev: "← 이전 단계",
        sec1Tag: "SECTION 01", sec1Title: "견적 산출 & 마감일",
        sec2Tag: "SECTION 02", sec2Title: "프로젝트 상세 자료",
        statusUnselected: "미선택", statusUnwritten: "미작성", statusCompleted: "✓ 완료",
        tt_live2d: "Live2D 리깅 파츠 분리 정도를 의미합니다. 상세 파츠 + 2.5D는 더 높은 입체감과 자연스러운 움직임을 구현합니다.",
        tt_video: "기본 4:00까지 초과금이 없으며, 4:01부터는 30초 단위로 10,000원이 자동 합산됩니다.",
        tt_materials: "모든 자료(일러스트, 음원 등)가 최종 수령된 날짜부터 작업 카운트다운(10일/15일)이 시작됩니다.",
        tt_deadline: "지정 마감일이 필요하신 경우 날짜를 작성해 주시면 일정 가능 여부 및 빠른 마감 비용 산출이 진행됩니다.",
        progressTitle: "필수 항목 작성",
        q1: "1. 사용 용도", q1_1: "방송용", q1_2: "상업용",
        q2: "2. Live 2D 추가", q2_desc: "Live 2D 추가시 기본 작업기간(10일)에 5일 추가되어 마감 기간이 작업 시작일로부터 15일이 됩니다. ※ 참고 가격이며 변동될 수 있습니다.", q2_1: "기본 파츠", q2_2: "상세 파츠", q2_3: "상세 파츠 + 2.5D",
        live2dExpandText: "Live 2D 리깅 옵션 추가하기", live2dCollapseText: "Live 2D 리깅 옵션 닫기",
        q3: "3. 영상 길이", q3_desc: "기본 4분을 초과할 경우 30초당 10,000원의 추가금이 있습니다. 4:01의 경우 추가금이 발생합니다.", q3_min: "분", q3_sec: "초",
        q4: "4. 추가금 (다중선택)", q4_copy: "4. 추가금", q4_1: "추가 인원", q4_1_sub: "+10,000원 / 명", q4_1_desc: "기본 2인 포함. 3인째부터 인당 +10,000원", q4_1_qty: "추가 인원수", unit_person: "명", q4_2: "빠른 마감", q4_2_sub: "협의 후 결정", q4_3: "간단 썸네일", q4_3_sub: "+8,000원", c_thumb: "간단 썸네일",
        q5: "5. 마감일", q5_copy: "5. 마감일", q5_desc: "기본적으로 작업 시작 후 10일(Live2D 추가시 15일)입니다. 빠른 마감의 경우 날짜를 적어주시면 일정을 고려하여 가격을 책정해드립니다.", q5_ph: "예: 2026년 06월 30일 (협의 가능)",
        q6: "6. 신청곡 링크", q6_copy: "6. 신청곡", q6_ph: "신청곡 링크를 입력해주세요.",
        q7: "7. 업로드 채널", q7_copy: "7. 업로드 채널", q7_ph: "예: 유튜브 채널명 또는 URL",
        q8: "8. 일러스트 음원 등의 자료", q8_copy: "8. 자료 첨부", q8_desc: "준비되지 않은 자료가 있다면 언제 전달 가능한지 적어주시길 바랍니다. 기본적으로 모든 자료를 전달받기 전에는 작업을 시작하지 않습니다.", q8_ph: "자료 링크 및 준비 상태에 대해 상세히 작성해주세요.",
        q9: "9. 참여자 라인업", q9_copy: "9. 참여자 라인업", q9_ph: "보컬, 일러스트레이터 등 참여자 라인업을 작성해주세요.",
        q10: "10. 기타 신청 내용을 작성해주세요.", q10_copy: "10. 추가 요청", q10_ph: "추가 문의사항이나 전달하고 싶으신 메시지가 있다면 작성해주세요.",
        resTitle: "예상 견적서", resEmpty: "항목을 선택하면 내역이 표시됩니다.", resTotal: "총 예상 견적", copyBtn: "복사하기", emailBtn: "견적서 바로 전송", resNotice: "※ 해당 금액은 예상 견적이며 실제 확정 견적과 다를 수 있습니다. 빠른 마감은 미포함된 가격입니다.",
        alert1: "1. 사용 용도를 선택해주세요.", alert5: "5. 마감일을 입력해주세요.", alert6: "6. 신청곡 링크를 입력해주세요.", alert7: "7. 업로드 채널을 입력해주세요.", alert8: "8. 자료를 입력해주세요.", alert9: "9. 참여자 라인업을 입력해주세요.",
        alertSuccess: "복사가 완료되었습니다. 문의 시 붙여넣기로 사용해주세요.", alertFail: "복사에 실패했습니다. 수동으로 복사해주세요.",
        c_use: "사용 용도", c_live: "Live 2D", c_vidEx: "영상 길이 초과", c_ppl: "추가 인원", c_fast: "빠른 마감", c_nego: "협의 후 결정", c_none: "없음",
        title: "WAVIT - 견적 계산기",
        contactPlaceholder: "회신받을 연락처 (이메일 / 디스코드)",
        alertContact: "연락처를 입력해주세요.",
        confirmSend: "입력하신 내용이 모두 정확한가요?\n확인을 누르시면 견적서가 전송됩니다.",
        sending: "전송 중...",
        sendSuccess: "이메일로 견적서가 전송되었습니다.\n확인 후 회신드리겠습니다.",
        sendFailPrefix: "전송에 실패했습니다:\n",
        systemError: "시스템 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.",
        modalCancel: "취소",
        modalConfirm: "확인",
        emailSubject: "[WAVIT 견적서] 새로운 견적 문의가 도착했습니다.",
        emailSenderName: "WAVIT 견적 계산기",
        mailHeader: "[WAVIT 온라인 견적 문의]",
        contactLabel: "연락처:",
        logNotice: "※ 서비스 품질 및 문의 확인을 위한 최소한의 로그가 기록될 수 있습니다.",
        unit_extra: "추가",
        q2_card_title: "Live 2D 리깅 옵션 추가",
        q2_card_sub: "+20,000원부터~ / 작업기간 +5일"
    },
    en: {
        curr: " KRW",
        headerDesc: "Select details below to instantly view your estimated quote.",
        step1: "Pricing & Deadline", step2: "Project Details",
        btnNext1: "Next (02. Project Details) →", btnPrev: "← Previous",
        sec1Tag: "SECTION 01", sec1Title: "Pricing & Deadline",
        sec2Tag: "SECTION 02", sec2Title: "Project Materials",
        statusUnselected: "Unselected", statusUnwritten: "Empty", statusCompleted: "✓ Done",
        tt_live2d: "Specifies the Live2D part separation level. Detailed Parts + 2.5D offers enhanced depth and smoother movement.",
        tt_video: "Base 4:00 has no extra fee. From 4:01 onward, 10,000 KRW per 30s is added.",
        tt_materials: "Work countdown (10 or 15 days) starts on the day all materials are received.",
        tt_deadline: "Specify a deadline if required; schedule availability and rush fee will be evaluated.",
        progressTitle: "Required Fields",
        q1: "1. Usage", q1_1: "Streaming", q1_2: "Commercial",
        q2: "2. Add Live 2D", q2_desc: "Adding Live 2D extends the base 10-day period by 5 days (total 15 days). ※ Prices are for reference only and subject to change.", q2_1: "Basic Parts", q2_2: "Detailed Parts", q2_3: "Detailed Parts + 2.5D",
        live2dExpandText: "Add Live 2D Rigging Option", live2dCollapseText: "Close Live 2D Rigging Option",
        q3: "3. Video Length", q3_desc: "Exceeding the base 4 mins incurs a fee of 10,000 KRW per 30 secs. (e.g., 4:01 applies the fee).", q3_min: "Min", q3_sec: "Sec",
        q4: "4. Extra Fees (Multiple)", q4_copy: "4. Extra Fees", q4_1: "Extra Person", q4_1_sub: "+10,000 KRW / Person", q4_1_desc: "Base 2 included. +10,000 KRW / person from 3rd", q4_1_qty: "Extra People", unit_person: "", q4_2: "Fast Deadline", q4_2_sub: "Negotiable", q4_3: "Simple Thumbnail", q4_3_sub: "+8,000 KRW", c_thumb: "Simple Thumbnail",
        q5: "5. Deadline", q5_copy: "5. Deadline", q5_desc: "Base is 10 days (15 for Live 2D). For faster deadlines, specify the date.", q5_ph: "e.g., June 30, 2026",
        q6: "6. Song Link", q6_copy: "6. Song Link", q6_ph: "Enter the song link.",
        q7: "7. Upload Channel", q7_copy: "7. Upload Channel", q7_ph: "e.g., YouTube Channel Name or URL",
        q8: "8. Materials (Illustrations, Audio, etc.)", q8_copy: "8. Attached Materials", q8_desc: "Specify when missing materials will be provided. Work starts only after all materials are received.", q8_ph: "Describe material links and status in detail.",
        q9: "9. Participant Lineup", q9_copy: "9. Lineup", q9_ph: "Please enter the participating vocalists and artists.",
        q10: "10. Any other requests?", q10_copy: "10. Additional Requests", q10_ph: "Add any extra inquiries or messages here.",
        resTitle: "ESTIMATE", resEmpty: "Select items to see the breakdown.", resTotal: "Total Estimate", copyBtn: "COPY", emailBtn: "Send Estimate Now", resNotice: "※ This is an estimated quote and may differ from the final price. Fast deadline fees are not included.",
        c_use: "Usage", c_live: "Live 2D", c_vidEx: "Video Time Extra", c_ppl: "Extra Person", c_fast: "Fast Deadline", c_nego: "Negotiable", c_none: "None",
        title: "WAVIT - Estimate Calculator",
        contactPlaceholder: "Contact info for reply (Email / Discord)",
        alertContact: "Please enter your contact information.",
        confirmSend: "Is all the information correct?\nClick Confirm to send the estimate.",
        sending: "Sending...",
        sendSuccess: "The estimate has been sent via email.\nWe will reply after reviewing.",
        sendFailPrefix: "Failed to send:\n",
        systemError: "A system error occurred.\nPlease try again later.",
        modalCancel: "Cancel",
        modalConfirm: "Confirm",
        emailSubject: "[WAVIT Estimate] A new quote inquiry has arrived.",
        emailSenderName: "WAVIT Estimate Calculator",
        mailHeader: "[WAVIT Online Quote Inquiry]",
        contactLabel: "Contact:",
        logNotice: "※ Minimal logs may be recorded for service quality and inquiry verification.",
        unit_extra: "added",
        q2_card_title: "Add Live 2D Rigging Option",
        q2_card_sub: "+20,000 KRW~ / +5 days"
    },
    ja: {
        curr: " ウォン",
        headerDesc: "詳細を選択・入力すると、すぐに見積もりを確認できます。",
        step1: "オプション選択・見積", step2: "詳細入力",
        btnNext1: "次へ (02. 詳細入力) →", btnPrev: "← 前へ",
        sec1Tag: "SECTION 01", sec1Title: "オプション・見積計算",
        sec2Tag: "SECTION 02", sec2Title: "プロジェクト詳細資料",
        statusUnselected: "未選択", statusUnwritten: "未入力", statusCompleted: "✓ 完了",
        tt_live2d: "Live2Dのパーツ分けレベルを指します。詳細パーツ + 2.5Dはより立体感と自然な動きを実現します。",
        tt_video: "基本4分まで追加料金なし。4分01秒以降は30秒ごとに10,000ウォンが加算されます。",
        tt_materials: "全資料（イラスト・音源等）が揃った日から作業カウント（10日/15日）が開始します。",
        tt_deadline: "希望納期がある場合はご記入ください。スケジュール確認および特急料金の算出を行います。",
        progressTitle: "必須項目の入力",
        q1: "1. 使用用途", q1_1: "配信用", q1_2: "商用",
        q2: "2. Live 2D 追加", q2_desc: "Live 2Dを追加する場合、基本作業期間(10日)に5日が追加され、納期は15日となります。 ※ 参考価格であり、変動する場合があります。", q2_1: "基本パーツ分け", q2_2: "詳細パーツ分け", q2_3: "詳細パーツ分け + 2.5D",
        q2_card_title: "Live 2D リギングオプションを追加", q2_card_sub: "+20,000ウォンから〜 / 作業期間 +5日",
        live2dExpandText: "Live 2D リギングオプションを追加する", live2dCollapseText: "Live 2D リギングオプションを閉じる",
        q3: "3. 動画の長さ", q3_desc: "基本の4分を超える場合、30秒ごとに10,000ウォンの追加料金が発生します（例：4分01秒から適用）。", q3_min: "分", q3_sec: "秒",
        q4: "4. 追加料金 (複数選択可)", q4_copy: "4. 追加料金", q4_1: "追加人数", q4_1_sub: "+10,000ウォン / 人", q4_1_desc: "基本2人含む。3人目から1人につき+10,000ウォン", q4_1_qty: "追加人数", unit_person: "人", q4_2: "お急ぎ納品", q4_2_sub: "要相談", q4_3: "簡単サムネイル", q4_3_sub: "+8,000ウォン", c_thumb: "簡単サムネイル",
        q5: "5. 希望納期", q5_copy: "5. 希望納期", q5_desc: "基本は10日（Live 2D追加時は15日）。お急ぎの場合は日付をご記入いただければスケジュールを考慮し価格を決定します。", q5_ph: "例：2026年06月30日（相談可）",
        q6: "6. 楽曲リンク", q6_copy: "6. 楽曲", q6_ph: "楽曲リンクを入力してください。",
        q7: "7. アップロード先", q7_copy: "7. アップロード先", q7_ph: "例：YouTubeチャンネル名またはURL",
        q8: "8. イラスト・音源などの資料", q8_copy: "8. 資料添付", q8_desc: "未準備の資料がある場合は提出予定日をご記入ください。全資料が揃うまで作業は開始しません。", q8_ph: "資料のリンクや準備状況を詳細にご記入ください。",
        q9: "9. 参加者ラインナップ", q9_copy: "9. ラインナップ", q9_ph: "参加したボーカル、イラストレーター等のラインナップをご記入ください。",
        q10: "10. その他", q10_copy: "10. その他", q10_ph: "追加の質問やメッセージがあればご記入ください。",
        resTitle: "見積書", resEmpty: "項目を選択すると内訳が表示されます。", resTotal: "合計見積額", copyBtn: "コピーする", emailBtn: "見積書を即時送信", resNotice: "※ この金額は見積もりであり、実際の確定金額とは異なる場合があります。お急ぎ納品料金は含まれていません。",
        alert1: "1. 使用用途を選択してください。", alert5: "5. 希望納期を入力してください。", alert6: "6. 楽曲リンクを入力してください。", alert7: "7. アップロード先を入力してください。", alert8: "8. 資料を入力してください。", alert9: "9. 参加者ラインナップを入力してください。",
        alertSuccess: "コピーが完了しました。お問い合わせの際に貼り付けてご使用ください。", alertFail: "コピーに失敗しました。手動でコピーしてください。",
        c_use: "使用用途", c_live: "Live 2D", c_vidEx: "動画の長さ超過", c_ppl: "追加人数", c_fast: "お急ぎ納品", c_nego: "要相談", c_none: "なし",
        title: "WAVIT - 見積もり計算ツール",
        contactPlaceholder: "返信用連絡先（メール / Discord）",
        alertContact: "連絡先を入力してください。",
        confirmSend: "入力内容に間違いはありませんか？\n「確認」を押すと見積もりが送信されます。",
        sending: "送信中...",
        sendSuccess: "見積もりをメールで送信しました。\n確認後、折り返しご連絡いたします。",
        sendFailPrefix: "送信に失敗しました：\n",
        systemError: "システムエラーが発生しました。\nしばらくしてからもう一度お試しください。",
        modalCancel: "キャンセル",
        modalConfirm: "確認",
        emailSubject: "[WAVIT 見積もり] 新しいお見積もりのご依頼が届きました。",
        emailSenderName: "WAVIT 見積もり計算ツール",
        mailHeader: "[WAVIT オンラインお見積もり依頼]",
        contactLabel: "連絡先：",
        logNotice: "※ サービス品質およびお問い合わせ確認のため、最小限のログが記録される場合があります。",
        unit_extra: "追加"
    }
};

function changeLanguage(lang) {
    if (lang === currentLang || isLangTransitioning) return;

    isLangTransitioning = true;

    // Immediately update language selector active button state
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const activeLangBtn = document.getElementById('lang-' + lang);
    if (activeLangBtn) activeLangBtn.classList.add('active');

    // Collect all elements affected by language change
    const targets = document.querySelectorAll(`
        [data-i18n],
        .option-price[data-base-price],
        #priceBreakdown,
        #totalEstimateText,
        #convertedPriceText,
        #logNoticeText,
        .lang-target
    `);

    // Phase 1: Fade-Out (0ms ~ 180ms)
    targets.forEach(el => {
        el.classList.remove('lang-fading-in');
        el.classList.add('lang-fading-out');
    });

    setTimeout(() => {
        // Actual text and language state update
        currentLang = lang;
        const t = i18n[lang];

        // Data-driven i18n text update
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) {
                el.textContent = t[key];
            }
        });

        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (t[key] !== undefined) {
                el.placeholder = t[key];
            }
        });

        // Declarative price text update via data-base-price attributes
        document.querySelectorAll('.option-price[data-base-price]').forEach(el => {
            const basePrice = parseInt(el.getAttribute('data-base-price')) || 0;
            const prefix = el.getAttribute('data-price-prefix') || '';
            el.textContent = `${prefix}${basePrice.toLocaleString()}${t.curr}`;
        });

        document.title = t.title;
        const contactInfoInput = document.getElementById('contactInfo');
        if (contactInfoInput) contactInfoInput.placeholder = t.contactPlaceholder;
        
        const modalCancelBtn = document.getElementById('customModalCancel');
        if (modalCancelBtn) modalCancelBtn.textContent = t.modalCancel;
        
        const modalConfirmBtn = document.getElementById('customModalConfirm');
        if (modalConfirmBtn) modalConfirmBtn.textContent = t.modalConfirm;
        
        const logNoticeEl = document.getElementById('logNoticeText');
        if (logNoticeEl && t.logNotice) logNoticeEl.textContent = t.logNotice;

        if (typeof gtag === 'function') {
            gtag('event', 'select_content', {
                content_type: 'language_button',
                item_id: lang
            });
        }

        calculateTotal();
        goToStep(currentStep, true);

        // Phase 2: Fade-In (180ms ~ 400ms)
        targets.forEach(el => {
            el.classList.remove('lang-fading-out');
            el.classList.add('lang-fading-in');
        });

        setTimeout(() => {
            targets.forEach(el => el.classList.remove('lang-fading-in'));
            isLangTransitioning = false;
        }, 220);

    }, 180);
}

function selectRadioCard(groupName, inputEl) {
    // Keep user-requested Toggle Off UX
    if (inputEl.dataset.wasChecked === "true") {
        inputEl.checked = false;
        inputEl.dataset.wasChecked = "false";
    } else {
        document.getElementsByName(groupName).forEach(el => {
            el.dataset.wasChecked = "false";
        });
        inputEl.dataset.wasChecked = "true";
    }

    // Update UI selection states
    document.getElementsByName(groupName).forEach(el => {
        const card = el.closest('.option-card');
        if (card) {
            if (el.checked) {
                card.classList.add('selected');
                card.setAttribute('aria-checked', 'true');

                if (typeof gtag === 'function') {
                    gtag('event', 'select_item', {
                        item_list_name: groupName,
                        item_name: el.value
                    });
                }
            } else {
                card.classList.remove('selected');
                card.setAttribute('aria-checked', 'false');
            }
        }
    });

    calculateTotal();
}

function toggleCheckboxCard(type) {
    const checkbox = document.getElementById(type + 'Check');
    const container = document.getElementById(type + 'Container');
    const qtyInput = document.getElementById(type + 'Qty');
    if (qtyInput) {
        if (checkbox.checked) {
            container.classList.add('checked');
            container.setAttribute('aria-checked', 'true');
            if (parseInt(qtyInput.value) <= 0) qtyInput.value = 1;
        } else {
            container.classList.remove('checked');
            container.setAttribute('aria-checked', 'false');
            qtyInput.value = 0;
        }
    } else {
        if (checkbox.checked) {
            container.classList.add('checked');
            container.setAttribute('aria-checked', 'true');
        } else {
            container.classList.remove('checked');
            container.setAttribute('aria-checked', 'false');
        }
    }
    calculateTotal();
}

function changeQuantity(type, delta) {
    const checkbox = document.getElementById(type + 'Check');
    const container = document.getElementById(type + 'Container');
    const qtyInput = document.getElementById(type + 'Qty');
    if (!qtyInput) return;

    let currentVal = parseInt(qtyInput.value) || 0;
    let newVal = currentVal + delta;

    if (newVal <= 0) {
        newVal = 0;
        if (checkbox) checkbox.checked = false;
        if (container) {
            container.classList.remove('checked');
            container.setAttribute('aria-checked', 'false');
        }
    } else {
        if (checkbox) checkbox.checked = true;
        if (container) {
            container.classList.add('checked');
            container.setAttribute('aria-checked', 'true');
        }
    }

    qtyInput.value = newVal;
    calculateTotal();
}

let isStepTransitioning = false;
let stepTransitionTimer = null;

function goToStep(stepNum, skipScroll = false) {
    if (stepNum < 1 || stepNum > 2 || isLangTransitioning) return;

    const leftSide = document.querySelector('.form-left-side');
    const currentCard = document.getElementById('step-card-' + currentStep);
    const targetCard = document.getElementById('step-card-' + stepNum);

    if (!leftSide || !targetCard) return;

    // Update current step index
    currentStep = stepNum;

    // Update onboarding step indicators
    for (let i = 1; i <= 2; i++) {
        const flow = document.getElementById('step-flow-' + i);
        if (flow) {
            if (i === currentStep) flow.classList.add('active');
            else flow.classList.remove('active');
        }
    }

    // Direct update without animation if skipScroll is true (e.g. language switch re-render)
    if (skipScroll) {
        for (let i = 1; i <= 2; i++) {
            const card = document.getElementById('step-card-' + i);
            if (card) {
                card.classList.remove('step-leaving', 'step-entering');
                if (i === currentStep) {
                    card.classList.remove('step-hidden');
                    card.classList.add('step-active');
                } else {
                    card.classList.add('step-hidden');
                    card.classList.remove('step-active');
                }
            }
        }
        leftSide.style.height = '';
        leftSide.style.overflow = '';
        return;
    }

    if (stepTransitionTimer) clearTimeout(stepTransitionTimer);
    isStepTransitioning = true;

    // 1. Lock initial height of container
    const startHeight = leftSide.getBoundingClientRect().height;
    leftSide.style.height = `${startHeight}px`;
    leftSide.style.overflow = 'hidden';

    // 2. Cross-fade phase 1: Fade out current card
    if (currentCard && currentCard !== targetCard) {
        currentCard.classList.remove('step-active');
        currentCard.classList.add('step-leaving');
    }

    setTimeout(() => {
        // Cross-fade phase 2: Swap visibility
        for (let i = 1; i <= 2; i++) {
            const card = document.getElementById('step-card-' + i);
            if (card && i !== currentStep) {
                card.classList.remove('step-active', 'step-leaving', 'step-entering');
                card.classList.add('step-hidden');
            }
        }

        targetCard.classList.remove('step-hidden', 'step-leaving');
        targetCard.classList.add('step-entering');

        // Measure natural height of target content
        const targetHeight = leftSide.scrollHeight;

        // Smoothly animate height transition
        leftSide.style.height = `${targetHeight}px`;

        requestAnimationFrame(() => {
            targetCard.classList.remove('step-entering');
            targetCard.classList.add('step-active');
        });

        // Smooth scroll position handling to prevent abrupt jumps
        const onboardingFlow = document.querySelector('.onboarding-flow');
        if (onboardingFlow) {
            const flowTop = onboardingFlow.getBoundingClientRect().top + window.scrollY - 20;
            if (window.scrollY > flowTop) {
                window.scrollTo({ top: Math.max(0, flowTop), behavior: 'smooth' });
            }
        }

        // Clean up inline styles after transition completes
        stepTransitionTimer = setTimeout(() => {
            leftSide.style.height = '';
            leftSide.style.overflow = '';
            isStepTransitioning = false;
        }, 320);
    }, 110);
}

function nextStep() {
    if (currentStep === 1) {
        const est = getEstimateDetails();
        const t = est.t;
        if (!est.useTypeActive) {
            showAlert(t.alert1);
            return;
        }
        if (!est.deadlineInfo) {
            showAlert(t.alert5, 'deadlineInfo');
            return;
        }
        goToStep(2);
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function updateFormProgress(est) {
    const t = i18n[currentLang];

    const checks = {
        q1: !!est.useTypeActive,
        q5: !!est.deadlineInfo,
        q6: !!est.musicInfo,
        q7: !!est.uploadChannel,
        q8: !!est.materialsInfo,
        q9: !!est.lineupInfo
    };

    let completedCount = 0;
    Object.keys(checks).forEach(key => {
        const isDone = checks[key];
        const statusEl = document.getElementById('status-' + key);
        if (statusEl) {
            if (isDone) {
                statusEl.textContent = t.statusCompleted || '✓ 완료';
                statusEl.classList.add('completed');
            } else {
                statusEl.textContent = key === 'q1' ? (t.statusUnselected || '미선택') : (t.statusUnwritten || '미작성');
                statusEl.classList.remove('completed');
            }
        }
        if (isDone) completedCount++;
    });

    const countEl = document.getElementById('progressCountText');
    const fillEl = document.getElementById('progressBarFill');
    if (countEl) countEl.textContent = `${completedCount} / 6`;
    if (fillEl) fillEl.style.width = `${Math.round((completedCount / 6) * 100)}%`;
}

function validateFormInputs(est) {
    const t = est.t;
    if (!est.useTypeActive) return { valid: false, message: t.alert1 };
    if (!est.deadlineInfo) return { valid: false, message: t.alert5, focusId: 'deadlineInfo' };
    if (!est.musicInfo) return { valid: false, message: t.alert6, focusId: 'musicInfo' };
    if (!est.uploadChannel) return { valid: false, message: t.alert7, focusId: 'uploadChannel' };
    if (!est.materialsInfo) return { valid: false, message: t.alert8, focusId: 'materialsInfo' };
    if (!est.lineupInfo) return { valid: false, message: t.alert9, focusId: 'lineupInfo' };
    return { valid: true };
}

// Single Source of Truth for Estimate Calculations
function getEstimateDetails() {
    const t = i18n[currentLang];
    const useTypeActive = document.querySelector('input[name="useType"]:checked');
    const useTypeValue = useTypeActive ? parseInt(useTypeActive.value) : 0;
    const useTypeName = useTypeActive ? useTypeActive.closest('.option-card').querySelector('.option-label').textContent : t.c_none;

    const live2dCheck = document.getElementById('live2dCheck') ? document.getElementById('live2dCheck').checked : false;
    const live2DActive = live2dCheck ? document.querySelector('input[name="live2D"]:checked') : null;
    const live2dValue = live2DActive ? parseInt(live2DActive.value) : 0;
    const live2DText = live2DActive ? live2DActive.closest('.option-card').querySelector('.option-label').textContent : t.c_none;

    const extraPeopleCheck = document.getElementById('extraPeopleCheck').checked;
    const extraPeopleQty = extraPeopleCheck ? Math.max(0, parseInt(document.getElementById('extraPeopleQty').value) || 0) : 0;
    const extraPeopleCost = extraPeopleCheck && extraPeopleQty > 0 ? extraPeopleQty * 10000 : 0;

    const videoMin = Math.max(0, parseInt(document.getElementById('videoMin').value) || 0);
    const videoSec = Math.min(59, Math.max(0, parseInt(document.getElementById('videoSec').value) || 0));
    const totalSeconds = (videoMin * 60) + videoSec;
    let extraTimeCost = 0;
    if (totalSeconds > 240) {
        const extraUnits = Math.ceil((totalSeconds - 240) / 30);
        extraTimeCost = extraUnits * 10000;
    }

    const thumbCheck = document.getElementById('simpleThumbnailCheck').checked;
    const thumbCost = thumbCheck ? 8000 : 0;

    const fastDeadlineCheck = document.getElementById('fastDeadlineCheck').checked;

    const total = useTypeValue + live2dValue + extraPeopleCost + extraTimeCost + thumbCost;
    const formattedTotal = total.toLocaleString();

    let convertedStr = "";
    if (currentLang === 'en' && exchangeRates.USD) {
        convertedStr = ` (≈ $${(total * exchangeRates.USD).toFixed(2)} USD)`;
    } else if (currentLang === 'ja' && exchangeRates.JPY) {
        convertedStr = ` (≈ ¥${Math.floor(total * exchangeRates.JPY).toLocaleString()} JPY)`;
    }

    const uploadChannel = document.getElementById('uploadChannel').value.trim();
    const musicInfo = document.getElementById('musicInfo').value.trim();
    const materialsInfo = document.getElementById('materialsInfo').value.trim();
    const lineupInfo = document.getElementById('lineupInfo').value.trim();
    const deadlineInfo = document.getElementById('deadlineInfo').value.trim();
    const otherDetails = document.getElementById('otherDetails').value.trim();

    return {
        t,
        useTypeActive, useTypeName, useTypeValue,
        live2DActive, live2DText, live2dValue,
        videoMin, videoSec, totalSeconds, extraTimeCost,
        extraPeopleCheck, extraPeopleQty, extraPeopleCost,
        thumbCheck, thumbCost,
        fastDeadlineCheck,
        total, formattedTotal, convertedStr,
        uploadChannel, musicInfo, materialsInfo, lineupInfo, deadlineInfo, otherDetails,
        safeUploadChannel: escapeHTML(uploadChannel),
        safeMusicInfo: escapeHTML(musicInfo),
        safeMaterialsInfo: escapeHTML(materialsInfo),
        safeLineupInfo: escapeHTML(lineupInfo),
        safeDeadlineInfo: escapeHTML(deadlineInfo),
        safeOtherText: escapeHTML(otherDetails || t.c_none)
    };
}

function toggleTooltip(id, event) {
    if (event) event.stopPropagation();
    const targetBox = document.getElementById(id);
    if (!targetBox) return;

    const isAlreadyActive = targetBox.classList.contains('active');

    document.querySelectorAll('.tooltip-box.active').forEach(box => {
        box.classList.remove('active');
    });

    if (!isAlreadyActive) {
        targetBox.classList.add('active');
    }
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.tooltip-box') && !e.target.closest('.tooltip-trigger')) {
        document.querySelectorAll('.tooltip-box.active').forEach(box => {
            box.classList.remove('active');
        });
    }
});

function toggleLive2DCard() {
    const checkbox = document.getElementById('live2dCheck');
    const container = document.getElementById('live2dContainer');
    const subContainer = document.getElementById('live2dSubContainer');

    if (!checkbox || !container || !subContainer) return;

    if (checkbox.checked) {
        container.classList.add('checked');
        container.setAttribute('aria-checked', 'true');
        subContainer.classList.add('expanded');

        const checkedRadio = document.querySelector('input[name="live2D"]:checked');
        if (!checkedRadio) {
            const defaultRadio = document.querySelector('input[name="live2D"][value="20000"]');
            if (defaultRadio) {
                defaultRadio.checked = true;
                selectRadioCard('live2D', defaultRadio);
            }
        }
    } else {
        container.classList.remove('checked');
        container.setAttribute('aria-checked', 'false');
        subContainer.classList.remove('expanded');

        document.getElementsByName('live2D').forEach(el => {
            el.checked = false;
            el.dataset.wasChecked = 'false';
            const card = el.closest('.option-card');
            if (card) {
                card.classList.remove('selected');
                card.setAttribute('aria-checked', 'false');
            }
        });
    }

    calculateTotal();
}

function calculateTotal() {
    const est = getEstimateDetails();
    const t = est.t;

    let breakdownHTML = '';
    if (est.useTypeValue > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_use} (${est.useTypeName})</span><span class="item-price">${est.useTypeValue.toLocaleString()}${t.curr}</span></div>`;
    }
    if (est.live2dValue > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_live} (${est.live2DText})</span><span class="item-price">+${est.live2dValue.toLocaleString()}${t.curr}</span></div>`;
    }
    if (est.extraTimeCost > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_vidEx}</span><span class="item-price">+${est.extraTimeCost.toLocaleString()}${t.curr}</span></div>`;
    }
    if (est.extraPeopleCost > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_ppl} (${est.extraPeopleQty}${t.unit_person || ''} ${t.unit_extra || '추가'})</span><span class="item-price">+${est.extraPeopleCost.toLocaleString()}${t.curr}</span></div>`;
    }
    if (est.thumbCost > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_thumb}</span><span class="item-price">+8,000${t.curr}</span></div>`;
    }
    if (est.fastDeadlineCheck) {
        breakdownHTML += `<div class="breakdown-item"><span>${t.c_fast}</span><span class="item-price">${t.c_nego}</span></div>`;
    }
    if (breakdownHTML === '') {
        breakdownHTML = `<div class="breakdown-item" style="color: var(--text-muted); font-size: 13px;">${t.resEmpty}</div>`;
    }

    document.getElementById('priceBreakdown').innerHTML = breakdownHTML;
    document.getElementById('totalEstimateText').innerText = `${t.resTotal}: ${est.formattedTotal}${t.curr}`;
    const convertedEl = document.getElementById('convertedPriceText');
    if (currentLang === 'en' && exchangeRates.USD) {
        convertedEl.innerText = `≈ $${(est.total * exchangeRates.USD).toFixed(2)} USD`;
    } else if (currentLang === 'ja' && exchangeRates.JPY) {
        convertedEl.innerText = `≈ ¥${Math.floor(est.total * exchangeRates.JPY).toLocaleString()} JPY`;
    } else {
        convertedEl.innerText = '';
    }

    updateFormProgress(est);
}


// 1.5 운영자용 비동기 이메일 로그 전송 함수 (5초 디바운싱 Throttling 적용)
let lastLogTime = 0;
function sendCopyLogToAdmin(plainText) {
    try {
        const now = Date.now();
        if (now - lastLogTime < 5000) return; // Throttle: Maximum 1 log per 5 seconds
        lastLogTime = now;

        const accessTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const userAgent = navigator.userAgent || 'Unknown';
        const screenSize = `${window.screen.width || 0}x${window.screen.height || 0}`;
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'ko';
        const pageUrl = window.location.href;

        const messageBody = `[WAVIT 복사하기 이벤트 로그]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 접속 일시: ${accessTime}
■ 언어 설정: ${lang}
■ 화면 해상도: ${screenSize}
■ 페이지 URL: ${pageUrl}
■ 브라우저 (User-Agent):
${userAgent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 복사된 견적 내역:
${plainText}`;

        fetch('https://api.staticforms.xyz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessKey: "sf_767a29f020dab85042ce629f",
                subject: "[WAVIT 견적서 Log] 복사하기 클릭 로그",
                name: "WAVIT Copy Logger",
                email: "no-reply@wavit.com",
                message: messageBody
            })
        }).catch(err => console.error('[CopyLog Error]', err));
    } catch (e) {
        console.error('[CopyLog Exception]', e);
    }
}

// 2. 모달 관련 지원 함수
function showAlert(message, focusElementId = null) {
    const overlay = document.getElementById('customModalOverlay');
    const msgEl = document.getElementById('customModalMessage');
    const cancelBtn = document.getElementById('customModalCancel');
    const confirmBtn = document.getElementById('customModalConfirm');
    const inputEl = document.getElementById('modalContactInput');

    msgEl.textContent = message;
    cancelBtn.style.display = 'none';
    inputEl.style.display = 'none';
    overlay.classList.add('active');

    confirmBtn.onclick = function () {
        overlay.classList.remove('active');
        if (focusElementId) document.getElementById(focusElementId).focus();
    };
}

function showPrompt(message, onConfirm) {
    const overlay = document.getElementById('customModalOverlay');
    const msgEl = document.getElementById('customModalMessage');
    const cancelBtn = document.getElementById('customModalCancel');
    const confirmBtn = document.getElementById('customModalConfirm');
    const inputEl = document.getElementById('modalContactInput');
    const t = i18n[currentLang];

    msgEl.textContent = message;
    inputEl.style.display = 'block';
    inputEl.value = '';
    inputEl.placeholder = t.contactPlaceholder;
    inputEl.style.borderColor = 'var(--nordic-border)';
    cancelBtn.style.display = 'block';
    
    overlay.classList.add('active');
    inputEl.focus();

    cancelBtn.onclick = () => overlay.classList.remove('active');
    
    confirmBtn.onclick = function() {
        const val = inputEl.value.trim();
        if (!val) {
            inputEl.style.borderColor = 'red';
            return;
        }
        overlay.classList.remove('active');
        onConfirm(val);
    };
}

// Event Handler: 복사하기 버튼
document.addEventListener('DOMContentLoaded', function () {
    // Initial state check for pre-checked radios
    document.querySelectorAll('.option-card input:checked').forEach(input => {
        const card = input.closest('.option-card');
        if (card) {
            card.classList.add('selected');
            card.setAttribute('aria-checked', 'true');
        }
        input.dataset.wasChecked = "true";
    });

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const est = getEstimateDetails();
            const validation = validateFormInputs(est);
            if (!validation.valid) { showAlert(validation.message, validation.focusId); return; }

            const t = est.t;
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    currency: 'KRW',
                    value: est.total,
                    selected_usage: est.useTypeName,
                    selected_live2d: est.live2DText,
                    has_extra_people: est.extraPeopleCheck,
                    fast_deadline: est.fastDeadlineCheck
                });
            }

            const useTypePriceText = `${est.useTypeValue.toLocaleString()}${t.curr}`;
            const live2DPriceText = `+${est.live2dValue.toLocaleString()}${t.curr}`;
            const videoPriceText = est.extraTimeCost > 0 ? `+${est.extraTimeCost.toLocaleString()}${t.curr}` : `0${t.curr}`;

            let plainExtraDetails = "";
            let htmlExtraDetails = "";

            if (est.extraPeopleCheck && est.extraPeopleQty > 0) {
                plainExtraDetails += `\n   - ${t.c_ppl}: ${est.extraPeopleQty}${t.unit_person || ''} ${t.unit_extra || '추가'} (+${est.extraPeopleCost.toLocaleString()}${t.curr})`;
                htmlExtraDetails += `<div>- ${t.c_ppl}: ${est.extraPeopleQty}${t.unit_person || ''} ${t.unit_extra || '추가'} <span style="font-size: 12px;">(+${est.extraPeopleCost.toLocaleString()}${t.curr})</span></div>`;
            }
            if (est.thumbCheck) {
                plainExtraDetails += `\n   - ${t.c_thumb} (+8,000${t.curr})`;
                htmlExtraDetails += `<div>- ${t.c_thumb} <span style="font-size: 12px;">(+8,000${t.curr})</span></div>`;
            }
            if (est.fastDeadlineCheck) {
                plainExtraDetails += `\n   - ${t.c_fast}: ${t.c_nego}`;
                htmlExtraDetails += `<div>- ${t.c_fast}: ${t.c_nego}</div>`;
            }

            if (plainExtraDetails === "") {
                plainExtraDetails = " " + t.c_none;
                htmlExtraDetails = t.c_none;
            }

            const plainText = `[WAVIT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.q1}: ${est.useTypeName} (${useTypePriceText})
${t.q2}: ${est.live2DText} (${live2DPriceText})
${t.q3}: ${est.videoMin}${t.q3_min} ${est.videoSec}${t.q3_sec} (${videoPriceText})
${t.q4_copy}:${plainExtraDetails.replace(/\n/g, '\n  ')}
${t.q5_copy}: ${est.safeDeadlineInfo}
${t.q6_copy}: ${est.safeMusicInfo}
${t.q7_copy}: ${est.safeUploadChannel}
${t.q8_copy}: ${est.safeMaterialsInfo}
${t.q9_copy}: ${est.safeLineupInfo}
${t.q10_copy}: ${est.safeOtherText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.resTotal}: ${est.formattedTotal}${t.curr}${est.convertedStr}
${t.resNotice}`;

            sendCopyLogToAdmin(plainText);

            const htmlText = `
    <table width="100%" style="max-width: 540px; border-collapse: collapse; font-family: 'Inter', -apple-system, sans-serif; color: #000000; line-height: 1.8; background-color: #ffffff; border: 1px solid #d4d4d8; border-top: 2px solid #000000;">
        <tr>
            <td style="padding: 32px;">
                <h2 style="margin: 0 0 8px 0; color: #000000; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: -0.015em;">WAVIT - ${t.resTitle}</h2>
                <p style="margin: 0 0 24px 0; color: #71717a; font-size: 13px;">${t.headerDesc}</p>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; width: 120px; color: #71717a; font-weight: 600;">${t.q1}</td><td style="padding: 12px 0; font-weight: 700; color: #000000;">${est.useTypeName} <span style="color: #000000; font-size: 12px; font-weight: 600;">(${useTypePriceText})</span></td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q2}</td><td style="padding: 12px 0; font-weight: 700; color: #000000;">${est.live2DText} <span style="color: #000000; font-size: 12px; font-weight: 600;">(${live2DPriceText})</span></td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q3}</td><td style="padding: 12px 0; font-weight: 700; color: #000000;">${est.videoMin}${t.q3_min} ${est.videoSec}${t.q3_sec} <span style="color: #000000; font-size: 12px; font-weight: 600;">(${videoPriceText})</span></td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600; vertical-align: top;">${t.q4_copy}</td><td style="padding: 12px 0; font-weight: 600; color: #000000; margin: 0;">${htmlExtraDetails}</td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q5_copy}</td><td style="padding: 12px 0; color: #000000;">${est.safeDeadlineInfo}</td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q6_copy}</td><td style="padding: 12px 0; color: #000000;">${est.safeMusicInfo}</td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q7_copy}</td><td style="padding: 12px 0; color: #000000;">${est.safeUploadChannel}</td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600; vertical-align: top;">${t.q8_copy}</td><td style="padding: 12px 0; color: #000000; white-space: pre-wrap;">${est.safeMaterialsInfo}</td></tr>
                    <tr style="border-bottom: 1px solid #d4d4d8;"><td style="padding: 12px 0; color: #71717a; font-weight: 600;">${t.q9_copy}</td><td style="padding: 12px 0; color: #000000;">${est.safeLineupInfo}</td></tr>
                    <tr style="border-bottom: 1px solid #000000;"><td style="padding: 12px 0; color: #71717a; font-weight: 600; vertical-align: top;">${t.q10_copy}</td><td style="padding: 12px 0; color: #000000; white-space: pre-wrap;">${est.safeOtherText}</td></tr>
                </table>
                
                <div style="margin-top: 24px; padding: 20px; background-color: #fafafa; text-align: center; border: 1px solid #000000;">
                    <span style="font-size: 18px; font-weight: 700; color: #000000;">${t.resTotal}: ${est.formattedTotal}${t.curr}</span>
                    <div style="font-size: 13px; color: #71717a; font-weight: 600; margin-top: 4px;">${est.convertedStr}</div>
                </div>
                <p style="font-size: 11px; color: #71717a; text-align: center; margin: 12px 0 0 0; font-weight: 500;">${t.resNotice}</p>
            </td>
        </tr>
    </table>
    `;

            const blobHTML = new Blob([htmlText], { type: 'text/html' });
            const blobText = new Blob([plainText], { type: 'text/plain' });

            if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHTML, 'text/plain': blobText })])
                    .then(() => showAlert(t.alertSuccess))
                    .catch(() => fallbackRichTextCopy(htmlText, plainText, t));
            } else {
                fallbackRichTextCopy(htmlText, plainText, t);
            }

            function fallbackRichTextCopy(html, plain, t) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = html;
                tempDiv.style.position = "fixed";
                tempDiv.style.top = "50%";
                tempDiv.style.left = "50%";
                tempDiv.style.transform = "translate(-50%, -50%)";
                tempDiv.style.width = "100%";
                tempDiv.style.opacity = "0";
                tempDiv.style.pointerEvents = "none";
                tempDiv.style.zIndex = "-1000";

                document.body.appendChild(tempDiv);

                const range = document.createRange();
                range.selectNodeContents(tempDiv);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showAlert(t.alertSuccess);
                    } else {
                        fallbackPlainTextOnly(plain, t);
                    }
                } catch (err) {
                    fallbackPlainTextOnly(plain, t);
                } finally {
                    selection.removeAllRanges();
                    document.body.removeChild(tempDiv);
                }
            }

            function fallbackPlainTextOnly(plain, t) {
                const textArea = document.createElement("textarea");
                textArea.value = plain;
                textArea.style.position = "fixed";
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showAlert(t.alertSuccess);
                } catch (e) {
                    showAlert(t.alertFail);
                }
                document.body.removeChild(textArea);
            }
        });
    }

    // Event Handler: 견적서 바로 전송 버튼
    const emailBtn = document.getElementById('emailBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', function () {
            const est = getEstimateDetails();
            const validation = validateFormInputs(est);
            if (!validation.valid) { showAlert(validation.message, validation.focusId); return; }

            const t = est.t;
            showPrompt(t.confirmSend, (contactInfo) => {
                const btn = document.getElementById('emailBtn');
                const originalText = btn.textContent;
                btn.textContent = t.sending;
                btn.disabled = true;

                let plainExtraDetails = "";
                if (est.extraPeopleCheck && est.extraPeopleQty > 0) {
                    plainExtraDetails += `\n   - ${t.c_ppl}: ${est.extraPeopleQty}${t.unit_person || ''} ${t.unit_extra || '추가'} (+${est.extraPeopleCost.toLocaleString()}${t.curr})`;
                }
                if (est.thumbCheck) plainExtraDetails += `\n   - ${t.c_thumb} (+8,000${t.curr})`;
                if (est.fastDeadlineCheck) plainExtraDetails += `\n   - ${t.c_fast}: ${t.c_nego}`;
                if (plainExtraDetails === "") plainExtraDetails = " " + t.c_none;

                const messageBody = `${t.mailHeader}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.contactLabel} ${contactInfo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.q1}: ${est.useTypeName} (${est.useTypeValue.toLocaleString()}${t.curr})
${t.q2}: ${est.live2DText} (+${est.live2dValue.toLocaleString()}${t.curr})
${t.q3}: ${est.videoMin}${t.q3_min} ${est.videoSec}${t.q3_sec} (+${est.extraTimeCost.toLocaleString()}${t.curr})
${t.q4_copy}:${plainExtraDetails.replace(/\n/g, '\n  ')}
${t.q5_copy}: ${est.deadlineInfo}
${t.q6_copy}: ${est.musicInfo}
${t.q7_copy}: ${est.uploadChannel}
${t.q8_copy}: ${est.materialsInfo}
${t.q9_copy}: ${est.lineupInfo}
${t.q10_copy}: ${est.otherDetails || t.c_none}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.resTotal}: ${est.formattedTotal}${t.curr}`;

                fetch('https://api.staticforms.xyz/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accessKey: "sf_767a29f020dab85042ce629f",
                        subject: t.emailSubject,
                        name: t.emailSenderName,
                        email: "no-reply@wavit.com",
                        message: messageBody
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showAlert(t.sendSuccess);
                        } else {
                            showAlert(t.sendFailPrefix + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert(t.systemError);
                    })
                    .finally(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    });
            });
        });
    }

    // Check for URL query param `embedded=true`
    const queryString = window.location.search;
    if (queryString) {
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.get('embedded') === 'true') {
            const emailBtn = document.getElementById('emailBtn');
            if (emailBtn) {
                emailBtn.style.display = 'none';
            }
        }
    }

    // Initial total calculation on load
    calculateTotal();
});
