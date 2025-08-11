"""
Manage.py for DonkMaster Django project.
"""
#!/usr/bin/env python
import os
import sys

def main():
    """Django管理コマンドのエントリポイント"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'donkmaster.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        raise ImportError(
            "Djangoがインストールされていません。仮想環境やパスを確認してください。"
        )
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
