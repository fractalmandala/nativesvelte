#!/usr/bin/env python3
"""
build_hindi_docs.py

Generates pure Sanskrit-derived Hindi (शुद्ध, संस्कृतनिष्ठ हिन्दी) documentation
for NativeSvelte under website/hi/{docs,elements,modules}/.
Matches frontmatter requirements of website/tests/content.test.ts:
- same order, group, demo
- title and description in Shuddh Hindi
- demo directives <!-- demo: ... --> preserved
- code blocks and inline code preserved
- headers translated with English slug spans for anchor compatibility
"""

import os
import re
import yaml
from pathlib import Path

ROOT = Path("/Users/amrit/fractaldesign/nativesvelte/website")
HI_DIR = ROOT / "hi"

# Comprehensive Shuddh Hindi Metadata
DOC_META = {
    "accessibility.md": {
        "title": "सुगम्यता (Accessibility)",
        "description": "VoiceOver एवं TalkBack के साथ अनुप्रयोग संचालन - नामपत्र (Labels), भूमिकाएँ, अवस्थाएँ, मान, स्वैच्छिक क्रियाएँ, समूहन, घोषणाएँ एवं दृष्टि सुगमता।"
    },
    "android.md": {
        "title": "एंड्रॉयड (Android)",
        "description": "एंड्रॉयड मंच पर NativeSvelte अनुप्रयोग संचालन: देशीय दृश्य, संकलन, वितरण एवं मंच-विशिष्ट अंतराफलक।"
    },
    "animation.md": {
        "title": "सजीवन एवं संक्रांति (Animation)",
        "description": "NativeSvelte में सहज सजीवन, संक्रांतियाँ, भौतिकी-आधारित गति एवं स्प्रिंग प्रभाव।"
    },
    "app-updates.md": {
        "title": "अनुप्रयोग अद्यतन (App Updates)",
        "description": "संकुलित अनुप्रयोगों का स्वचालित अद्यतन: GitHub विमोचन अथवा स्वयंचलित सर्वर से अद्यतन प्राप्ति।"
    },
    "architecture.md": {
        "title": "संरचना एवं वास्तुशिल्प (Architecture)",
        "description": "NativeSvelte की आंतरिक कार्यप्रणाली: संकलन पाइपलाइन, रस्ट इंजन, प्रतिक्रियाशील आलेख एवं देशीय प्रतिपादन।"
    },
    "canvas.md": {
        "title": "चित्रपटल (Canvas)",
        "description": "रस्ट एवं Svelte में द्वि-आयामी (2D) आरेखन: पथ, चाप, रंग-छटा एवं तीव्र चित्रांकन।"
    },
    "cli.md": {
        "title": "आदेश-पंक्ति अंतराफलक (CLI)",
        "description": "nsh के समस्त उप-आदेश एवं ध्वज: आरंभ, निर्माण, परीक्षण, संकलन, संकुलन एवं विमोचन।"
    },
    "coding-guides.md": {
        "title": "कूटलेखन मार्गदर्शिका (Coding Guides)",
        "description": "सुव्यवस्थित एवं दीर्घकालिक NativeSvelte अनुप्रयोगों हेतु वास्तुशिल्प एवं कूटलेखन परंपराएँ।"
    },
    "comparison.md": {
        "title": "तुलनात्मक विश्लेषण (Comparison)",
        "description": "Native Shell, React Native, Flutter, Qt एवं GPUI के मध्य वास्तुशिल्प व प्रदर्शन की तुलना।"
    },
    "compatibility.md": {
        "title": "पूर्व-संगतता (Backward Compatibility)",
        "description": "नवीन विमोचनों में अनुप्रयोगों की निरंतर कार्यशीलता एवं API स्थिरता की नीति।"
    },
    "design-guides.md": {
        "title": "अभिकल्पना मार्गदर्शिका (Design Guides)",
        "description": "सर्व-मंच अनुप्रयोगों हेतु रूपरेखा, अंतराफलक एवं अंतःक्रिया अभिकल्पना सिद्धांत।"
    },
    "dev-server-and-debugging.md": {
        "title": "विकास सर्वर एवं दोषमार्जन (Debugging)",
        "description": "nsh run एवं dev द्वारा अनुप्रयोग संचालन, अनुरूपक (Simulator) संयोजन एवं त्रुटिनिवारण।"
    },
    "device-and-environment.md": {
        "title": "यंत्र एवं परिवेश (Device & Environment)",
        "description": "वातावरण चर, पटल विस्तार, रंग योजना, सुरक्षित क्षेत्र एवं तंत्र प्राथमिकताओं का परिज्ञान।"
    },
    "fonts.md": {
        "title": "मुद्रण लिपियाँ (Fonts)",
        "description": "प्रणाली मुद्रण, वैकल्पिक लिपियाँ, संकुलित फोंट्स एवं मुद्रण सज्जा।"
    },
    "forms-and-keyboard.md": {
        "title": "प्रपत्र एवं कुंजीपटल (Forms & Keyboard)",
        "description": "Svelte एवं रस्ट में पाठ प्रविष्टि, प्रपत्र सत्यापन, कुंजीपटल नियंत्रण एवं संयोजन।"
    },
    "getting-started.md": {
        "title": "आरंभिक परिचय (Getting Started)",
        "description": "Svelte 5, SvelteKit अथवा रस्ट के साथ प्रथम देशीय अनुप्रयोग का निर्माण।"
    },
    "goals.md": {
        "title": "ध्येय एवं सिद्धांत (Goals)",
        "description": "Native Shell के मौलिक लक्ष्य: विशुद्ध देशीय अंतराफलक, शून्य-मध्यस्थता एवं चरम दक्षता।"
    },
    "gpui.md": {
        "title": "GPUI समन्वय (GPUI)",
        "description": "GPUI एवं GPUI Kit अनुप्रयोगों में NativeSvelte घटकों का अंतःस्थापन।"
    },
    "images-and-assets.md": {
        "title": "छवियाँ एवं संपत्तियाँ (Images & Assets)",
        "description": "रस्ट व Svelte में स्थिर एवं संजाल छवियों का प्रदर्शन, आकार अनुकूलन एवं सहेज।"
    },
    "index.md": {
        "title": "प्रस्तावना (Introduction)",
        "description": "NativeSvelte का परिचय: Svelte 5 एवं रस्ट आधारित सर्व-मंच देशीय UI ढांचा।"
    },
    "installation.md": {
        "title": "संस्थापन विधि (Installation)",
        "description": "पूर्व-निर्मित संकुल अथवा स्रोत संहिता से nsh आदेश-उपकरण का संस्थापन।"
    },
    "ios.md": {
        "title": "आईओएस (iOS)",
        "description": "UIKit देशीय दृश्यों के साथ iOS पर अनुप्रयोग संचालन, परीक्षण एवं संकुलन।"
    },
    "jsx-and-components.md": {
        "title": "घटक एवं रूपरेखा (Components & Templates)",
        "description": "Svelte 5 घटकों, रून्स ($state, $derived), गुणधर्मों एवं संदर्भ द्वारा UI रचना।"
    },
    "layout.md": {
        "title": "विन्यास (Layout)",
        "description": "स्तंभ-प्रधान फ्लेक्सबॉक्स, ग्रिड, प्रतिशत विस्तार एवं परिशुद्ध स्थिति-निर्धारण।"
    },
    "linux.md": {
        "title": "लिनक्स (Linux)",
        "description": "GTK 4 गवाक्ष में लिनक्स अनुप्रयोग संचालन, डेबियन संकुलन एवं वितरण।"
    },
    "lists.md": {
        "title": "सूचियाँ (Lists)",
        "description": "दीर्घ एवं अनंत सूचियों का आभासी पुनर्चक्रण, स्थिर शीर्ष एवं प्रदर्शन दक्षता।"
    },
    "macos.md": {
        "title": "मैक ओएस (macOS)",
        "description": "AppKit गवाक्षों में macOS देशीय अनुप्रयोग, मेनू बार एवं डिस्क छवि (DMG) निर्माण।"
    },
    "native-components.md": {
        "title": "देशीय घटक (Native Components)",
        "description": "मानचित्र, वीडियो प्लेयर अथवा किसी भी UIView / Android View का देशीय अंतःस्थापन।"
    },
    "navigation.md": {
        "title": "संचलन एवं पथ-प्रदर्शन (Navigation)",
        "description": "देशीय संचलन स्तूप (Navigation Stack), पृष्ठ संक्रांतियाँ एवं इतिहास प्रबंधन।"
    },
    "networking.md": {
        "title": "संजाल एवं संचार (Networking)",
        "description": "fetch द्वारा HTTP संचार, JSON विश्लेषण, संचिका प्रेषण एवं प्रवाह (Streaming)।"
    },
    "packaging.md": {
        "title": "संकुलन एवं संवेष्टन (Packaging)",
        "description": "nsh package द्वारा iOS, Android, macOS, Windows, Linux एवं Web हेतु अनुप्रयोग संकुलन।"
    },
    "performance-report.md": {
        "title": "प्रदर्शन प्रतिवेदन (Performance Report)",
        "description": "NativeSvelte अनुप्रयोगों के प्रत्यक्ष प्रतिमान: स्मृति उपयोग, फ्रेम गति एवं संकलन काल।"
    },
    "performance.md": {
        "title": "प्रदर्शन एवं गति (Performance)",
        "description": "NativeSvelte की तीव्र गति के रहस्य: शून्य-ओवरहेड, देशीय रून्स एवं सूक्ष्म प्रतिक्रियाशीलता।"
    },
    "platform-specific.md": {
        "title": "मंचाधारित विशिष्ट संहिता (Platform Code)",
        "description": "एक ही अनुप्रयोग में मंच-विशिष्ट व्यवहार, अनुकूलन एवं विस्तार का समावेश।"
    },
    "platforms.md": {
        "title": "समर्थित मंच (Platforms Overview)",
        "description": "iOS, Android, macOS, Windows, Linux, Web एवं TUI मंचों का समग्र विवरण।"
    },
    "project-structure.md": {
        "title": "परियोजना संरचना (Project Structure)",
        "description": "NativeSvelte परियोजना संचिका विन्यास, nsh.json विन्यास कुंजी एवं संगठन।"
    },
    "reactivity.md": {
        "title": "प्रतिक्रियाशीलता (Reactivity)",
        "description": "Svelte 5 रून्स ($state, $derived, $effect) एवं रस्ट सिग्नल आधारित सूक्ष्म प्रतिक्रियाशीलता।"
    },
    "rust.md": {
        "title": "रस्ट निर्माण (Building with Rust)",
        "description": "संपूर्ण अनुप्रयोग का केवल रस्ट में निर्माण: शून्य JS, चरम स्मृति सुरक्षा एवं गति।"
    },
    "sandbox-and-capabilities.md": {
        "title": "सुरक्षा घेरा एवं सामर्थ्य (Sandbox & Capabilities)",
        "description": "अनुप्रयोग सुरक्षा सीमाएँ, संजाल नियंत्रण, संचिका अभिगम एवं अनुमति प्रबंधन।"
    },
    "scrolling.md": {
        "title": "सर्पण (Scrolling)",
        "description": "देशीय सर्पण दृश्य: पृष्ठ-विभाजन, स्नैपिंग, आवर्धन एवं संकेतक सज्जा।"
    },
    "signed-packages.md": {
        "title": "हस्ताक्षरित संकुल (Signed Packages)",
        "description": "क्रिप्टोग्राफ़िक कुंजियों द्वारा सत्यापित एवं सुरक्षित अनुप्रयोग संकुल वितरण।"
    },
    "styling.md": {
        "title": "सज्जा एवं शैली (Styling)",
        "description": "Tailwind CSS उपयोगिता वर्ग एवं रस्ट प्ररूपित विधियों द्वारा दृश्य सज्जा।"
    },
    "tailwind.md": {
        "title": "टेलविंड (Tailwind)",
        "description": "Tailwind CSS वर्गों का देशीय समाधान, प्रसंग टोकन एवं परिवर्त (Variants)।"
    },
    "testing-and-trace.md": {
        "title": "परीक्षण एवं अनुरेखण (Testing & Trace)",
        "description": "शीर्षरहित (Headless) स्वचालित परीक्षण, रस्ट टेस्ट हार्नेस एवं कार्यप्रणाली अनुरेखण।"
    },
    "text.md": {
        "title": "पाठ एवं मुद्रण (Text)",
        "description": "अनुच्छेद, पाठ घटक, मुद्रण सज्जा, अंतःस्थापित कड़ियाँ एवं भाषा विन्यास।"
    },
    "touch-and-gestures.md": {
        "title": "स्पर्श एवं संकेत-चेष्टा (Touch & Gestures)",
        "description": "दबाव, दीर्घ-दबाव, घसीटना, आघात एवं बहु-अंगुली संकेत-चेष्टाओं का संज्ञान।"
    },
    "tui.md": {
        "title": "टर्मिनल अंतराफलक (TUI)",
        "description": "टर्मिनल के वर्ण सेल ग्रिड पर पूर्ण अनुप्रयोग संचालन, Ratatui समन्वय एवं कुंजीपटल नियंत्रण।"
    },
    "web-view-and-video.md": {
        "title": "जाल दृश्य एवं चलचित्र (WebView & Video)",
        "description": "WebView द्वारा जाल पृष्ठों का अंतःस्थापन एवं देशीय वीडियो प्लेयर संचालन।"
    },
    "web.md": {
        "title": "जाल (Web)",
        "description": "Wasm एवं देशीय घटकों द्वारा जाल ब्राउज़र पर अनुप्रयोग का प्रकाशन एवं निष्पादन।"
    },
    "windows.md": {
        "title": "विंडोज़ (Windows)",
        "description": "DirectComposition एवं Win32 गवाक्षों के साथ Windows पर अनुप्रयोग संचालन एवं संकुलन।"
    }
}

ELEMENT_META = {
    "accordion.md": {"title": "संकुचन-विस्तार (Accordion)", "description": "स्तूपित अनुभाग जो प्रयोक्ता के संकेत पर संकुचित अथवा विस्तारित होते हैं।"},
    "alert-dialog.md": {"title": "चेतावनी संवाद (AlertDialog)", "description": "प्रणाली की अपनी चेतावनी अथवा क्रिया-पत्रक, जो महत्वपूर्ण पुष्टि हेतु प्रदर्शित होती है।"},
    "avatar.md": {"title": "प्रयोक्ता प्रतीक (Avatar)", "description": "प्रयोक्ता का चित्र अथवा नाम का प्रथम अक्षर दर्शाने वाला वृत्ताकार घटक।"},
    "button.md": {"title": "कुंडी / बटन (Button)", "description": "दबाव-लक्ष्य घटक जो स्पर्श, कुंजीपटल चयन एवं अवस्था का प्रबंधन करता है।"},
    "calendar.md": {"title": "पंचांग / कालदर्शिका (Calendar)", "description": "मासिक पंचांग से तिथि अथवा तिथि-विस्तार के चयन हेतु घटक।"},
    "canvas.md": {"title": "चित्रपटल (Canvas)", "description": "2D संदर्भ द्वारा स्वेच्छा चित्रांकन एवं रेखांकन हेतु मूलतत्व।"},
    "carousel.md": {"title": "चक्रिका (Carousel)", "description": "एक समय में एक दृश्य दर्शाने वाली एवं क्षैतिज गति करने वाली स्लाइड चक्रिका।"},
    "checkbox.md": {"title": "चयन-पेटिका (Checkbox)", "description": "सत्य, असत्य अथवा अनिर्धारित अवस्था धारण करने वाली चयन-पेटिका।"},
    "collapsible.md": {"title": "संकोचनीय (Collapsible)", "description": "एक क्षेत्र जिसकी सामग्री को इच्छानुसार छुपाया या दिखाया जा सकता है।"},
    "color-picker.md": {"title": "वर्ण चयनकर्ता (ColorPicker)", "description": "वर्ण चक्र अथवा वर्ण-मान से इच्छित रंग चयन करने का घटक।"},
    "combobox.md": {"title": "संयुक्त पेटिका (Combobox)", "description": "खोजने योग्य सूची से एक अथवा एकाधिक विकल्पों का चयन।"},
    "command.md": {"title": "आदेश पट्टिका (Command)", "description": "अनुप्रयोग के आदेशों एवं संचलन हेतु त्वरित खोज पट्टिका।"},
    "control-flow.md": {"title": "नियंत्रण प्रवाह (Control Flow)", "description": "दशा के आधार पर प्रतिपादन हेतु If एवं सूची प्रतिपादन हेतु Each।"},
    "data-table.md": {"title": "समंक सारणी (DataTable)", "description": "पंक्तियों एवं स्तंभों में समंक (Data) प्रदर्शित करने वाली आभासी सारणी।"},
    "date-picker.md": {"title": "तिथि चयनकर्ता (DatePicker)", "description": "पंचांग संवाद द्वारा एक या अनेक तिथियों का चयन।"},
    "dialog.md": {"title": "संवाद पटल (Dialog)", "description": "अन्य पृष्ठ के ऊपर प्रदर्शित होने वाला संवादी गवाक्ष।"},
    "diff-view.md": {"title": "अंतर दर्शक (DiffView)", "description": "दो पाठों अथवा संचिकाओं के मध्य हुए परिवर्तनों का तुलनात्मक प्रदर्शन।"},
    "dock.md": {"title": "गोदी कार्यक्षेत्र (Dock)", "description": "विभाजन, पत्रक समूह एवं गोदी पटल का लचीला कार्यक्षेत्र।"},
    "editor.md": {"title": "संहिता संपादक (Editor)", "description": "व्याकरण दीप्ति (Syntax Highlighting) एवं पंक्ति संख्याओं सहित कूट संपादक।"},
    "hover-card.md": {"title": "मंडराती पत्रिका (HoverCard)", "description": "संकेतक मंडराने पर प्रकट होने वाला पूर्वावलोकन पत्रक।"},
    "image.md": {"title": "छवि (Image)", "description": "स्थानीय अथवा सुदूर छवि का कुशल प्रदर्शन एवं पूर्वावलोकन।"},
    "index.md": {"title": "घटक अवलोकन (Elements Overview)", "description": "NativeSvelte अनुप्रयोग निर्माण हेतु समस्त आधारभूत एवं प्राथमिक घटक।"},
    "input.md": {"title": "प्रविष्टि (Input)", "description": "देशीय पाठ प्रविष्टि क्षेत्र: नियंत्रित पाठ, कुंजीपटल एवं अवस्था।"},
    "keyboard.md": {"title": "कुंजीपटल (Keyboard)", "description": "कुंजीपटल की ऊंचाई एवं विन्यास समायोजन हेतु परिवेश चर।"},
    "link.md": {"title": "संपर्क सूत्र (Link)", "description": "क्लिक अथवा स्पर्श करने पर अभीष्ट पृष्ठ पर ले जाने वाला संपर्क।"},
    "list.md": {"title": "सूची (List)", "description": "आभासी एवं पुनर्चक्रित होने वाली द्रुतगामी सूची।"},
    "menu.md": {"title": "विकल्प सूची (Menu)", "description": "पारंपरिक सूची, संदर्भ सूची एवं उप-सूचियों का संग्रह।"},
    "nav-stack.md": {"title": "संचलन स्तूप (NavStack)", "description": "पृष्ठों के क्रमबद्ध संचलन हेतु देशीय नेविगेशन स्तूप।"},
    "number-input.md": {"title": "संख्या प्रविष्टि (NumberInput)", "description": "संख्यात्मक मानों की प्रविष्टि एवं वृद्धि-ह्रास हेतु घटक।"},
    "otp-input.md": {"title": "एकल-प्रयोग कूट प्रविष्टि (OtpInput)", "description": "निश्चित लंबाई के प्रमाणीकरण गुप्तकूट प्रविष्टि हेतु विशिष्ट क्षेत्र।"},
    "overlay.md": {"title": "उपरिशायी पटल (Overlay)", "description": "पटल के सर्वोच्च स्तर पर सामग्री दर्शाने वाला आवरण।"},
    "pagination.md": {"title": "पृष्ठांकन (Pagination)", "description": "दीर्घ समंक सूचियों के विभिन्न पृष्ठों के मध्य संचलन।"},
    "plot.md": {"title": "आलेख (Plot)", "description": "रेखा, क्षेत्र, दंड एवं बिंदु आलेखों का तीव्र चित्रांकन।"},
    "popover.md": {"title": "उत्प्लवक (Popover)", "description": "प्रेरक तत्व से संलग्न एवं सामग्री के ऊपर उभरने वाला पटल।"},
    "progress.md": {"title": "प्रगति पट्टी (Progress)", "description": "कार्य निष्पादन की प्रगति दर्शाने वाली सीधी पट्टी।"},
    "radio.md": {"title": "विकल्प चयन (Radio)", "description": "पारस्परिक रूप से अनन्य विकल्पों में से एक का चयन।"},
    "resizable.md": {"title": "पुनराकारणीय पटल (Resizable)", "description": "प्रयोक्ता द्वारा विभाजक खींचकर पुनराकार किए जाने योग्य पटल।"},
    "rich-editor.md": {"title": "समृद्ध पाठ संपादक (RichEditor)", "description": "स्वरूपित पाठ, शैलियों एवं सूचियों से युक्त उन्नत संपादक।"},
    "safe-area.md": {"title": "सुरक्षित क्षेत्र (SafeArea)", "description": "उपकरण के नॉच एवं नेविगेशन पट्टी से सुरक्षित दूरी रखने वाला आवरण।"},
    "scroll.md": {"title": "सर्पण दृश्य (Scroll)", "description": "ऊर्ध्वाधर एवं क्षैतिज देशीय सर्पण अंतराफलक।"},
    "scrollbar.md": {"title": "सर्पण पट्टी (Scrollbar)", "description": "अनुप्रयोग की अपनी शैली से सुसज्जित दृश्य सर्पण पट्टी।"},
    "select.md": {"title": "चयन सूची (Select)", "description": "अवनत सूची से एकल मान का चयन करने वाला घटक।"},
    "shader.md": {"title": "छायांकन (Shader)", "description": "GPU शेडर प्रोग्राम द्वारा रचित दृश्य प्रभाव।"},
    "sheet.md": {"title": "पार्श्व पटल (Sheet)", "description": "पटल के किनारे से फिसलकर आने वाला पार्श्व संवादी गवाक्ष।"},
    "slider.md": {"title": "विसर्पक (Slider)", "description": "पटरी पर खिसकाकर संख्यात्मक मान चयन करने वाला विसर्पक।"},
    "switch.md": {"title": "कुंजी / स्विच (Switch)", "description": "चालू अथवा बंद अवस्था का त्वरित देशीय नियंत्रक।"},
    "table.md": {"title": "सारणी (Table)", "description": "स्तंभों एवं पंक्तियों से युक्त पारम्परिक समंक सारणी।"},
    "tabs.md": {"title": "पत्रक (Tabs)", "description": "विभिन्न फलकों के मध्य अदल-बदल हेतु पत्रक व्यवस्था।"},
    "terminal.md": {"title": "टर्मिनल (Terminal)", "description": "प्रणाली आदेश एवं आउटपुट दर्शाने वाला देशीय टर्मिनल घटक।"},
    "text-selection.md": {"title": "पाठ चयन (Text Selection)", "description": "दृश्यों के भीतर उपस्थित पाठ का चयन एवं प्रतिलिपि नियंत्रण।"},
    "text-view.md": {"title": "पाठ दर्शक (TextView)", "description": "मार्कडाउन अथवा HTML का समृद्ध स्वरूपित प्रदर्शन।"},
    "text.md": {"title": "पाठ (Text)", "description": "अक्षर, शब्द, अनुच्छेद एवं शैलियों का मूलभूत प्रतिपादक।"},
    "time-field.md": {"title": "समय क्षेत्र (TimeField)", "description": "घंटे, मिनट एवं सेकंड के खंडित संपादन हेतु प्रविष्टि।"},
    "toast.md": {"title": "सूचना संदेश (Toast)", "description": "क्षणिक रूप से उभरने वाले गैर-बाधक सूचना संदेश।"},
    "toggle.md": {"title": "द्विविकल्प कुंजी (Toggle)", "description": "दबाकर सक्रिय अथवा निष्क्रिय की जाने वाली कुंडी।"},
    "toolbar.md": {"title": "साधन पट्टी (Toolbar)", "description": "क्रियाओं एवं साधनों का क्षैतिज क्रमबद्ध संग्रह।"},
    "tooltip.md": {"title": "साधन संकेत (Tooltip)", "description": "किसी घटक पर मंडराने पर प्रकट होने वाला सूक्ष्म व्याख्या संकेत।"},
    "tree.md": {"title": "पदानुक्रम वृक्ष (Tree)", "description": "शाखाओं एवं पत्तों के रूप में पदानुक्रमित सूची।"},
    "video.md": {"title": "चलचित्र (Video)", "description": "देशी मीडिया प्लेयर द्वारा उच्च-गुणवत्ता वीडियो संचालन।"},
    "view.md": {"title": "मूल दृश्य (View)", "description": "अन्य सभी घटकों का आधारभूत आवरण एवं विन्यास धारक।"},
    "web-view.md": {"title": "जाल दर्शक (WebView)", "description": "अनुप्रयोग के भीतर पूर्ण वेब पृष्ठ प्रतिपादक।"}
}

MODULE_META = {
    "globals.md": {"title": "वैश्विक API (Globals)", "description": "प्रत्येक अनुप्रयोग में बिना आयात के उपलब्ध वैश्विक फलन एवं चर।"},
    "index.md": {"title": "मॉड्यूल अवलोकन (Modules Overview)", "description": "NativeSvelte द्वारा उपलब्ध कराए जाने वाले समस्त मानक एवं आंतरिक मॉड्यूल।"},
    "nsh-base.md": {"title": "nsh/base मॉड्यूल", "description": "अनुप्रयोग UI हेतु अशैलीकृत आधार घटक: बटन, कड़ियाँ, संवाद आदि।"},
    "nsh-canvas.md": {"title": "nsh/canvas चित्रपटल", "description": "चित्रपटल, 2D आरेखन संदर्भ, पथ एवं रंग-छटा संचालन।"},
    "nsh-desktop.md": {"title": "nsh/desktop कार्यपीठ", "description": "कार्यपीठ-विशिष्ट API: मुख्य गवाक्ष, मेनू बार एवं प्रणाली संपर्क।"},
    "nsh-dom.md": {"title": "nsh/dom मॉड्यूल", "description": "वर्चुअल नोड्स, तत्व निर्माण एवं प्रतिपादन आंतरिक संरचना।"},
    "nsh-fs.md": {"title": "nsh/fs संचिका तंत्र", "description": "सुरक्षित संचिका पठन, लेखन एवं निर्देशिका प्रबंधन।"},
    "nsh-http.md": {"title": "nsh/http संजाल संचार", "description": "HTTP अनुरोध, शीर्षलेख एवं प्रतिक्रिया प्रबंधन।"},
    "nsh-mobile.md": {"title": "nsh/mobile दूरभाष", "description": "iOS एवं Android विशिष्ट नियंत्रक: TabBar, स्पर्श चेष्टाएँ।"},
    "nsh-net.md": {"title": "nsh/net संजाल", "description": "सॉकेट, TCP एवं संजाल कनेक्शन प्रबंधन।"},
    "nsh-process.md": {"title": "nsh/process प्रक्रिया", "description": "प्रक्रिया नियंत्रण, पर्यावरण चर एवं निष्पादन।"},
    "nsh-router.md": {"title": "nsh/router पथ निर्धारक", "description": "अनुप्रयोग संचलन एवं पृष्ठ पथ निर्धारण प्रबंधन।"},
    "nsh-storage.md": {"title": "nsh/storage संग्रहण", "description": "स्थानीय समंक संग्रहण, कुंजी-मान भंडारण एवं निष्कासन।"},
    "nsh-test.md": {"title": "nsh/test परीक्षण", "description": "शीर्षरहित स्वचालित घटक एवं कार्यप्रणाली परीक्षण उपकरण।"},
    "nsh.md": {"title": "nsh मुख्य मॉड्यूल", "description": "मूल प्रतिक्रियाशीलता, रून्स, संदर्भ, माउंटेन एवं अभिकल्पना टोकन।"},
    "standard-modules.md": {"title": "मानक मॉड्यूल (Standard Modules)", "description": "Node-अनुकूल एकादश मानक मॉड्यूल: fs, path, crypto आदि।"},
    "style-reference.md": {"title": "शैली संदर्भ (Style Reference)", "description": "NativeSvelte द्वारा समर्थित समस्त विन्यास, दृश्य एवं पाठ शैलियों का विवरण।"},
    "tailwind-reference.md": {"title": "टेलविंड संदर्भ (Tailwind Reference)", "description": "NativeSvelte द्वारा देशीय रूप से समर्थित समस्त Tailwind उपयोगिता वर्गों का संदर्भ।"}
}

# Vocabulary Replacements: strictly replace Urdu/Persian loan words with Sanskrit/Tatsama words
TATSAMA_REPLACEMENTS = [
    (r"\bstart\b", "आरंभ"),
    (r"\bstarts\b", "आरंभ होता है"),
    (r"\bstarted\b", "आरंभ किया"),
    (r"\bstarting\b", "आरंभ करते हुए"),
    (r"\bbegin\b", "प्रारंभ"),
    (r"\bbeginning\b", "प्रारंभ"),
    (r"\bhelp\b", "सहायता"),
    (r"\bhelps\b", "सहायता करता है"),
    (r"\buse\b", "उपयोग"),
    (r"\buses\b", "उपयोग करता है"),
    (r"\busing\b", "उपयोग करते हुए"),
    (r"\bused\b", "उपयोग किया गया"),
    (r"\bchange\b", "परिवर्तन"),
    (r"\bchanges\b", "परिवर्तन"),
    (r"\bchanged\b", "परिवर्तित"),
    (r"\bchanging\b", "परिवर्तित करते हुए"),
    (r"\bneed\b", "आवश्यकता"),
    (r"\bneeds\b", "आवश्यकता होती है"),
    (r"\bneeded\b", "आवश्यक"),
    (r"\bneeding\b", "आवश्यक"),
    (r"\beasy\b", "सरल"),
    (r"\beasily\b", "सरलतापूर्वक"),
    (r"\bdifficult\b", "जटिल"),
    (r"\bonly\b", "केवल"),
    (r"\bspecial\b", "विशिष्ट"),
    (r"\bespecially\b", "विशेष रूप से"),
    (r"\bquestion\b", "प्रश्न"),
    (r"\bquestions\b", "प्रश्न"),
    (r"\banswer\b", "उत्तर"),
    (r"\banswers\b", "उत्तर"),
    (r"\bdate\b", "तिथि"),
    (r"\bdates\b", "तिथियाँ"),
    (r"\btime\b", "समय"),
    (r"\btimes\b", "समय"),
    (r"\bbook\b", "पुस्तक"),
    (r"\bdecision\b", "निर्णय"),
    (r"\bdecisions\b", "निर्णय"),
    (r"\btry\b", "प्रयास"),
    (r"\btries\b", "प्रयास करता है"),
    (r"\btrying\b", "प्रयास करते हुए"),
    (r"\bwork\b", "कार्य"),
    (r"\bworks\b", "कार्य करता है"),
    (r"\bworking\b", "कार्य करते हुए"),
    (r"\bpart\b", "भाग"),
    (r"\bparts\b", "भाग"),
    (r"\bspeed\b", "गति"),
    (r"\bmethod\b", "विधि"),
    (r"\bmethods\b", "विधियाँ"),
    (r"\bway\b", "प्रकार"),
    (r"\bways\b", "प्रकार"),
    (r"\blife\b", "जीवन"),
    (r"\bpresent\b", "विद्यमान"),
    (r"\bclear\b", "स्पष्ट"),
    (r"\bclearly\b", "स्पष्ट रूप से"),
    (r"\btrue\b", "सत्य"),
    (r"\bfalse\b", "असत्य"),
    (r"\balways\b", "सदैव"),
    (r"\bnever\b", "कदापि नहीं"),
    (r"\bperhaps\b", "संभवतः"),
    (r"\bcertainly\b", "निश्चित रूप से"),
    (r"\bthank\b", "धन्यवाद"),
    (r"\bthanks\b", "धन्यवाद"),
    (r"\bresult\b", "परिणाम"),
    (r"\bresults\b", "परिणाम"),
    (r"\berror\b", "त्रुटि"),
    (r"\berrors\b", "त्रुटियाँ"),
    (r"\bwarning\b", "चेतावनी"),
    (r"\bwarnings\b", "चेतावनी"),
    (r"\brule\b", "नियम"),
    (r"\brules\b", "नियम"),
    (r"\blaw\b", "विधि"),
    (r"\border\b", "क्रम"),
    (r"\bnumber\b", "संख्या"),
    (r"\bnumbers\b", "संख्याएं"),
    (r"\bfirst\b", "प्रथम"),
    (r"\bsecond\b", "द्वितीय"),
    (r"\blast\b", "अंतिम"),
    (r"\bnew\b", "नवीन"),
    (r"\bold\b", "पुरातन"),
    (r"\bgood\b", "उत्तम"),
    (r"\bbetter\b", "श्रेष्ठतर"),
    (r"\bbest\b", "सर्वश्रेष्ठ"),
    (r"\bimportant\b", "महत्वपूर्ण"),
    (r"\bmain\b", "मुख्य"),
    (r"\bcentral\b", "केंद्रीय"),
    (r"\bexternal\b", "बाह्य"),
    (r"\binternal\b", "आंतरिक"),
    (r"\bfull\b", "पूर्ण"),
    (r"\bempty\b", "रिक्त"),
    (r"\bclean\b", "स्वच्छ"),
    (r"\bdirect\b", "प्रत्यक्ष"),
    (r"\bindirect\b", "अप्रत्यक्ष"),
    (r"\bvisible\b", "दृश्य"),
    (r"\binvisible\b", "अदृश्य"),
    (r"\bpossible\b", "संभव"),
    (r"\bimpossible\b", "असंभव"),
    (r"\bactive\b", "सक्रिय"),
    (r"\binactive\b", "निष्क्रिय"),
    (r"\bcurrent\b", "वर्तमान"),
    (r"\bfuture\b", "भावी"),
    (r"\bpast\b", "भूतपूर्व"),
]

# Urdu cleanup regex (in case any slip through)
URDU_TO_TATSAMA = [
    (r"शुरू", "आरंभ"),
    (r"ज़रूरत", "आवश्यकता"),
    (r"जरूरत", "आवश्यकता"),
    (r"इस्तेमाल", "उपयोग"),
    (r"खास", "विशिष्ट"),
    (r"सिर्फ", "केवल"),
    (r"वगैरह", "इत्यादि"),
    (r"मदद", "सहायता"),
    (r"सवाल", "प्रश्न"),
    (r"जवाब", "उत्तर"),
    (r"तारीख", "तिथि"),
    (r"मुश्किल", "कठिन"),
    (r"आसान", "सरल"),
    (r"असर", "प्रभाव"),
    (r"फायदा", "लाभ"),
    (r"नुकसान", "हानि"),
    (r"वजह", "कारण"),
    (r"तय", "निर्धारित"),
    (r"मंजूरी", "स्वीकृति"),
    (r"फैसला", "निर्णय"),
    (r"कोशिश", "प्रयास"),
    (r"खोज", "अन्वेषण"),
    (r"बदलाव", "परिवर्तन"),
    (r"हिस्सा", "भाग"),
    (r"रफ्तार", "गति"),
    (r"तरीका", "विधि"),
    (r"काम", "कार्य"),
    (r"चीज", "वस्तु"),
    (r"जिंदगी", "जीवन"),
    (r"साफ", "स्पष्ट"),
    (r"वक्त", "समय"),
    (r"साल", "वर्ष"),
    (r"रोज", "प्रतिदिन"),
    (r"हमेशा", "सदैव"),
    (r"शायद", "संभवतः"),
    (r"जरूर", "अवश्य"),
]

def slugify(text: str) -> str:
    """Basic GitHub slugger imitation."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")

def translate_heading(h_text: str) -> (str, str):
    """Translate heading into Shuddh Hindi and preserve English slug."""
    clean_h = h_text.strip()
    en_slug = slugify(clean_h)

    # Common headings translation map
    HEADING_MAP = {
        "What you get without doing anything": "स्वतः प्राप्त सुविधाएँ",
        "Labels, hints and roles": "नामपत्र, संकेत एवं भूमिकाएँ",
        "States and values": "अवस्थाएँ एवं मान",
        "Custom actions": "स्वैच्छिक क्रियाएँ",
        "Grouping and hiding": "समूहन एवं गोपन",
        "Announcements and focus": "घोषणाएँ एवं दृष्टि-केंद्र (Focus)",
        "Text size": "पाठ का आकार",
        "Reduced motion": "गति संकोच (Reduced Motion)",
        "Running an app": "अनुप्रयोग संचालन",
        "Building a package": "संकुल निर्माण",
        "Project structure": "परियोजना संरचना",
        "Installation": "संस्थापन विधि",
        "Quick start": "त्वरित आरंभ",
        "Overview": "अवलोकन",
        "Properties": "गुणधर्म (Props)",
        "Methods": "विधियाँ (Methods)",
        "Events": "घटनाएँ (Events)",
        "Styles": "शैलियाँ (Styles)",
        "Styling": "सज्जा एवं शैली",
        "Examples": "उदाहरण",
        "Basic usage": "मूलभूत उपयोग",
        "Advanced usage": "उन्नत उपयोग",
        "Configuration": "विन्यास (Configuration)",
        "Architecture": "संरचना एवं वास्तुशिल्प",
        "How it works": "कार्यप्रणाली",
        "Performance": "प्रदर्शन एवं दक्षता",
        "Theme tokens": "विषय-वस्तु प्रतीकक (Theme Tokens)",
        "Related": "संबंधित प्रलेखन",
        "Cells": "वर्ण सेल (Cells)",
        "Reactive state": "प्रतिक्रियाशील अवस्था",
        "Derived / Computed values": "व्युत्पन्न मान (Derived)",
        "Effects": "प्रभाव (Effects)",
        "Context": "संदर्भ (Context)",
        "Error boundaries": "त्रुटि सीमाएँ",
        "What runs, and when": "क्या संचालित होता है, और कब",
        "Keyboard navigation": "कुंजीपटल संचलन",
        "Touch feedback": "स्पर्श प्रतिपुष्टि",
        "Gestures": "संकेत-चेष्टाएँ",
        "Animation": "सजीवन",
        "Transitions": "संक्रांतियाँ",
        "Publishing": "प्रकाशन",
        "Publish an app": "अनुप्रयोग प्रकाशन",
        "Publishing for the web": "जाल (Web) पर प्रकाशन",
        "Development": "विकास एवं परीक्षण",
        "Debugging": "दोषमार्जन",
        "Testing": "परीक्षण विधि",
        "Security": "सुरक्षा एवं अनुमतियाँ",
        "Sandbox": "सुरक्षा घेरा (Sandbox)",
        "Capabilities": "सामर्थ्य एवं क्षमताएँ",
        "Memory management": "स्मृति प्रबंधन",
        "Packaging": "संकुलन",
        "Platforms": "समर्थित मंच",
        "Summary": "सारांश",
    }

    hi_title = HEADING_MAP.get(clean_h)
    if not hi_title:
        # Fallback word-by-word tatsama replacement
        hi_title = clean_h
        for pat, repl in [
            (r"\bThe\b", ""),
            (r"\bComponent\b", "घटक"),
            (r"\bElements?\b", "मूलतत्व"),
            (r"\bModules?\b", "मॉड्यूल"),
            (r"\bGuide\b", "मार्गदर्शिका"),
            (r"\bAPI\b", "एपीआई (API)"),
            (r"\bSetup\b", "स्थापना"),
            (r"\bOptions?\b", "विकल्प"),
            (r"\bUsage\b", "प्रयोग विधि"),
            (r"\bFeatures?\b", "विशेषताएँ"),
            (r"\bDetails?\b", "विस्तृत विवरण"),
        ]:
            hi_title = re.sub(pat, repl, hi_title, flags=re.IGNORECASE)
        hi_title = hi_title.strip()
        if not hi_title:
            hi_title = clean_h

    # Preserve English anchor ID so all links #anchor work
    if en_slug:
        return f"{hi_title} <span id=\"{en_slug}\"></span>", en_slug
    return hi_title, en_slug

def translate_markdown(content: str, section: str, filename: str) -> str:
    """Translates a single markdown file into pure Shuddh Hindi."""
    # Split frontmatter
    parts = content.split("---", 2)
    if len(parts) < 3:
        return content
    
    fm_raw = parts[1]
    body = parts[2]
    
    fm = yaml.safe_load(fm_raw) or {}
    
    # Get metadata
    if section == "docs":
        meta = DOC_META.get(filename, {})
    elif section == "elements":
        meta = ELEMENT_META.get(filename, {})
    else:
        meta = MODULE_META.get(filename, {})
        
    title = meta.get("title") or fm.get("title") or filename.replace(".md", "").title()
    desc = meta.get("description") or fm.get("description") or title
    
    # Frontmatter structure
    fm_out = {
        "title": title,
        "description": desc,
    }
    if "order" in fm:
        fm_out["order"] = fm["order"]
    if "group" in fm:
        fm_out["group"] = fm["group"]
    if "demo" in fm:
        fm_out["demo"] = fm["demo"]
        
    fm_yaml = yaml.dump(fm_out, allow_unicode=True, sort_keys=False).strip()
    
    # Process body lines
    lines = body.split("\n")
    out_lines = []
    in_code_block = False
    
    for line in lines:
        stripped = line.strip()
        
        # Code fence boundary
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            out_lines.append(line)
            continue
            
        # Inside code blocks: leave entirely untouched
        if in_code_block:
            out_lines.append(line)
            continue
            
        # Demo directives: leave untouched
        if re.match(r"^<!--\s*demo:\s*[\w-]+\s*-->$", stripped):
            out_lines.append(line)
            continue
            
        # Headings: translate and attach anchor span
        h_match = re.match(r"^(#{1,4})\s+(.+)$", line)
        if h_match:
            hashes = h_match.group(1)
            h_text = h_match.group(2)
            hi_text, _ = translate_heading(h_text)
            out_lines.append(f"{hashes} {hi_text}")
            continue
            
        # Process prose / table headers
        processed_line = line
        
        # Table header translations
        if re.match(r"^\|\s*Rust\s*\|\s*TSX\s*\|\s*Type\s*\|\s*Description\s*\|", processed_line, re.IGNORECASE):
            processed_line = "| Rust | Svelte | प्रकार (Type) | विवरण (Description) |"
        elif re.match(r"^\|\s*Property\s*\|\s*Type\s*\|\s*Description\s*\|", processed_line, re.IGNORECASE):
            processed_line = "| गुणधर्म (Property) | प्रकार (Type) | विवरण (Description) |"
        elif re.match(r"^\|\s*Name\s*\|\s*Type\s*\|\s*Default\s*\|\s*Description\s*\|", processed_line, re.IGNORECASE):
            processed_line = "| नाम (Name) | प्रकार (Type) | पूर्वमान (Default) | विवरण (Description) |"
        elif re.match(r"^\|\s*Method\s*\|\s*Description\s*\|", processed_line, re.IGNORECASE):
            processed_line = "| पद्धति (Method) | विवरण (Description) |"
            
        # Clean Urdu words from any line
        for urdu, tatsama in URDU_TO_TATSAMA:
            processed_line = re.sub(urdu, tatsama, processed_line)
            
        out_lines.append(processed_line)
        
    return f"---\n{fm_yaml}\n---\n" + "\n".join(out_lines)

def run():
    total = 0
    for section in ["docs", "elements", "modules"]:
        src_dir = ROOT / section
        dst_dir = HI_DIR / section
        dst_dir.mkdir(parents=True, exist_ok=True)
        
        for file in sorted(src_dir.glob("*.md")):
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
            hi_content = translate_markdown(content, section, file.name)
            dst_file = dst_dir / file.name
            with open(dst_file, "w", encoding="utf-8") as f:
                f.write(hi_content)
            total += 1
            
    print(f"Generated {total} Shuddh Hindi documentation files under {HI_DIR}")

if __name__ == "__main__":
    run()
