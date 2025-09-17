#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF文本提取工具
支持多种PDF解析库：PyPDF2, pdfminer.six, PyMuPDF
"""

import os
import sys
from pathlib import Path

def extract_with_pypdf2(pdf_path):
    """使用PyPDF2提取PDF文本"""
    try:
        from PyPDF2 import PdfReader
        
        with open(pdf_path, 'rb') as file:
            reader = PdfReader(file)
            text = ""
            
            print(f"PyPDF2: 检测到 {len(reader.pages)} 页")
            
            for page_num, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                if page_text.strip():
                    text += f"\n=== 第 {page_num} 页 (PyPDF2) ===\n"
                    text += page_text + "\n"
                    
        return text
    except Exception as e:
        print(f"PyPDF2 提取失败: {e}")
        return None

def extract_with_pdfminer(pdf_path):
    """使用pdfminer.six提取PDF文本"""
    try:
        from pdfminer.high_level import extract_text
        
        text = extract_text(pdf_path)
        if text.strip():
            return f"\n=== PDFMiner提取结果 ===\n{text}\n"
        return None
    except Exception as e:
        print(f"PDFMiner 提取失败: {e}")
        return None

def extract_with_pymupdf(pdf_path):
    """使用PyMuPDF提取PDF文本"""
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        text = ""
        
        print(f"PyMuPDF: 检测到 {len(doc)} 页")
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()
            if page_text.strip():
                text += f"\n=== 第 {page_num + 1} 页 (PyMuPDF) ===\n"
                text += page_text + "\n"
                
        doc.close()
        return text
    except Exception as e:
        print(f"PyMuPDF 提取失败: {e}")
        return None

def extract_pdf_text(pdf_path, output_path=None):
    """综合提取PDF文本内容"""
    if not os.path.exists(pdf_path):
        print(f"错误: PDF文件不存在 - {pdf_path}")
        return None
        
    print(f"开始提取PDF文件: {pdf_path}")
    
    # 尝试多种方法提取文本
    results = {}
    
    # 方法1: PyPDF2
    print("\n尝试使用 PyPDF2...")
    pypdf2_text = extract_with_pypdf2(pdf_path)
    if pypdf2_text:
        results['PyPDF2'] = pypdf2_text
        print("PyPDF2 提取成功")
    
    # 方法2: PDFMiner
    print("\n尝试使用 PDFMiner...")
    pdfminer_text = extract_with_pdfminer(pdf_path)
    if pdfminer_text:
        results['PDFMiner'] = pdfminer_text
        print("PDFMiner 提取成功")
    
    # 方法3: PyMuPDF
    print("\n尝试使用 PyMuPDF...")
    pymupdf_text = extract_with_pymupdf(pdf_path)
    if pymupdf_text:
        results['PyMuPDF'] = pymupdf_text
        print("PyMuPDF 提取成功")
    
    if not results:
        print("所有方法都无法提取文本内容")
        return None
    
    # 合并结果
    combined_text = f"# PDF文本提取结果\n\n文件: {pdf_path}\n提取时间: {__import__('datetime').datetime.now()}\n\n"
    
    # 选择最佳结果（优先PyMuPDF，然后PDFMiner，最后PyPDF2）
    if 'PyMuPDF' in results:
        best_text = results['PyMuPDF']
        method = 'PyMuPDF'
    elif 'PDFMiner' in results:
        best_text = results['PDFMiner']
        method = 'PDFMiner'
    else:
        best_text = results['PyPDF2']
        method = 'PyPDF2'
    
    combined_text += f"## 主要内容 (使用 {method})\n\n{best_text}\n\n"
    
    # 添加其他方法的结果作为参考
    if len(results) > 1:
        combined_text += "## 其他方法提取结果（参考）\n\n"
        for method_name, text in results.items():
            if method_name != method:
                combined_text += f"### {method_name}\n\n{text}\n\n"
    
    # 保存结果
    if output_path:
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(combined_text)
            print(f"\n提取结果已保存到: {output_path}")
        except Exception as e:
            print(f"保存文件失败: {e}")
    
    return combined_text

def main():
    """主函数"""
    # PDF文件路径
    pdf_path = "REF/淘贝课堂演示需求.pdf"
    output_path = "淘贝课堂演示需求_提取内容.md"
    
    # 检查文件是否存在
    if not os.path.exists(pdf_path):
        print(f"错误: 找不到PDF文件 - {pdf_path}")
        print("请确认文件路径是否正确")
        return
    
    # 提取文本
    result = extract_pdf_text(pdf_path, output_path)
    
    if result:
        print("\n=== 提取完成 ===")
        print(f"文本长度: {len(result)} 字符")
        print(f"输出文件: {output_path}")
    else:
        print("\n=== 提取失败 ===")

if __name__ == "__main__":
    main()