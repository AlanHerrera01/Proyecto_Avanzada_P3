package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.dto.Loan.LoanRequestData;
import com.grupobb.biblioteca.dto.Loan.LoanResponse;

import java.util.List;

public interface LoanService {

    LoanResponse createLoan(LoanRequestData request);

    LoanResponse returnLoan(Long loanId);

    List<LoanResponse> list();

    LoanResponse getById(Long loanId);
}
