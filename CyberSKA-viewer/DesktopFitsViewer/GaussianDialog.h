#ifndef GAUSSIANDIALOG_H
#define GAUSSIANDIALOG_H

#include <QDialog>

namespace Ui {
    class GaussianDialog;
}

class GaussianDialog : public QDialog
{
    Q_OBJECT

public:
    explicit GaussianDialog(QWidget *parent = 0);
    ~GaussianDialog();

private:
    Ui::GaussianDialog *ui;
};

#endif // GAUSSIANDIALOG_H
